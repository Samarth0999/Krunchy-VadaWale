import { supabase } from '../config/supabase';
import { StaffProfile, StaffRole, StaffPermissions, getDefaultPermissions } from '../types';

const STORAGE_KEYS = {
  CURRENT_STAFF: 'krunchy_current_staff_v2',
  STAFF_DIRECTORY: 'krunchy_staff_directory_v2'
};

// Default initial staff profiles for clean start / local fallback
const defaultStaffProfiles: StaffProfile[] = [
  {
    id: 'staff_admin_default',
    email: 'ssmds.samarthgore@gmail.com',
    name: 'Samarth Gore',
    role: 'Admin',
    isActive: true,
    permissions: getDefaultPermissions('Admin'),
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff_cashier_default',
    email: 'cashier@krunchy.com',
    name: 'Counter 1',
    role: 'Cashier',
    isActive: true,
    permissions: getDefaultPermissions('Cashier'),
    createdAt: new Date().toISOString()
  }
];

class AuthService {
  private currentStaff: StaffProfile | null = null;
  private authListeners: ((staff: StaffProfile | null) => void)[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.loadCachedStaff();
    this.initAuthListener();
  }

  private loadCachedStaff() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STAFF);
      if (raw) {
        this.currentStaff = JSON.parse(raw);
      }
    } catch (e) {
      this.currentStaff = null;
    }
  }

  public subscribe(listener: (staff: StaffProfile | null) => void): () => void {
    this.authListeners.push(listener);
    // Immediately call with current state
    listener(this.currentStaff);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.authListeners.forEach(listener => listener(this.currentStaff));
  }

  public getCurrentStaff(): StaffProfile | null {
    return this.currentStaff;
  }

  public getStaffDirectory(): StaffProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STAFF_DIRECTORY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) { }
    return defaultStaffProfiles;
  }

  public async saveStaffDirectory(list: StaffProfile[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.STAFF_DIRECTORY, JSON.stringify(list));
    try {
      // Sync to Supabase staff_profiles if connected
      for (const staff of list) {
        await supabase.from('staff_profiles').upsert({
          id: staff.id,
          email: staff.email.toLowerCase().trim(),
          name: staff.name,
          role: staff.role,
          avatar_url: staff.avatarUrl || null,
          permissions: staff.permissions || getDefaultPermissions(staff.role),
          is_active: staff.isActive
        });
      }
    } catch (e) { }
  }

  public async addStaffMember(
    email: string, 
    name: string, 
    role: StaffRole,
    customPermissions?: StaffPermissions
  ): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, message: 'Email address is required.' };
    }

    const directory = this.getStaffDirectory();
    if (directory.some(s => s.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `Staff member with email ${cleanEmail} is already registered.` };
    }

    const newStaff: StaffProfile = {
      id: `staff_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      role,
      isActive: true,
      permissions: customPermissions || getDefaultPermissions(role),
      createdAt: new Date().toISOString()
    };

    const updated = [...directory, newStaff];
    await this.saveStaffDirectory(updated);
    return { success: true, message: `Authorized ${cleanEmail} as ${role}.` };
  }

  public async updateStaffPermissions(
    staffId: string, 
    permissions: StaffPermissions
  ): Promise<{ success: boolean; message: string }> {
    const directory = this.getStaffDirectory();
    const index = directory.findIndex(s => s.id === staffId);
    if (index === -1) {
      return { success: false, message: 'Staff member not found.' };
    }

    directory[index].permissions = permissions;
    await this.saveStaffDirectory(directory);

    try {
      await supabase
        .from('staff_profiles')
        .update({ permissions })
        .eq('id', staffId);
    } catch (e) {}

    // If currently logged-in user was updated, immediately refresh their live session
    if (this.currentStaff && this.currentStaff.id === staffId) {
      this.currentStaff = { ...this.currentStaff, permissions };
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF, JSON.stringify(this.currentStaff));
      } catch (e) {}
      this.notify();
    }

    return { success: true, message: `Permissions updated for ${directory[index].name}.` };
  }

  public async removeStaffMember(staffId: string): Promise<{ success: boolean; message: string }> {
    const directory = this.getStaffDirectory();
    const updated = directory.filter(s => s.id !== staffId);
    await this.saveStaffDirectory(updated);

    try {
      await supabase.from('staff_profiles').delete().eq('id', staffId);
    } catch (e) { }

    return { success: true, message: 'Staff member removed.' };
  }

  // --- OAUTH & EMAIL LOGIN FLOWS ---

  /**
   * Launch Google OAuth Sign-In flow via Supabase
   */
  public async signInWithGoogle(): Promise<{ error?: string }> {
    try {
      const redirectUrl = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Google Sign-In failed to initialize.' };
    }
  }

  /**
   * Traditional Email & Password fallback sign-in
   */
  public async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const result = await this.verifyAndLinkStaffProfile(data.user);
        if (!result.authorized) {
          await supabase.auth.signOut();
          return { success: false, error: result.message };
        }
        return { success: true };
      }

      return { success: false, error: 'Sign in returned no user credentials.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  }

  /**
   * Quick bypass / offline cashier login (e.g. for emergency counter operation)
   */
  public loginOfflineCashier(role: StaffRole = 'Cashier', name: string = 'Counter 1'): void {
    const offlineProfile: StaffProfile = {
      id: `offline_${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@krunchy.local`,
      name,
      role,
      isActive: true,
      permissions: getDefaultPermissions(role),
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.setSession(offlineProfile);
  }

  /**
   * Checks Supabase user against staff_profiles table and links Google UID
   */
  public async verifyAndLinkStaffProfile(authUser: any): Promise<{ authorized: boolean; message?: string; staff?: StaffProfile }> {
    const email = authUser.email?.toLowerCase().trim();
    if (!email) {
      return { authorized: false, message: 'Google account does not provide an email address.' };
    }

    const userName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split('@')[0];
    const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null;

    try {
      // 1. Try calling the PostgreSQL stored procedure
      const { data: rpcData, error: rpcError } = await supabase.rpc('handle_staff_oauth_login', {
        user_email: email,
        user_uid: authUser.id,
        user_name: userName,
        user_avatar: avatarUrl
      });

      if (!rpcError && rpcData) {
        if (!rpcData.authorized) {
          return {
            authorized: false,
            message: rpcData.message || `Unauthorized account. The Google email (${email}) is not registered by the administrator.`
          };
        }

        const role = rpcData.staff.role as StaffRole;
        const staff: StaffProfile = {
          id: rpcData.staff.id,
          authUserId: rpcData.staff.auth_user_id || authUser.id,
          email: rpcData.staff.email,
          name: rpcData.staff.name,
          role,
          avatarUrl: rpcData.staff.avatar_url,
          isActive: true,
          permissions: (rpcData.staff.permissions as StaffPermissions) || getDefaultPermissions(role),
          lastLoginAt: new Date().toISOString()
        };

        this.setSession(staff);
        return { authorized: true, staff };
      }

      // 2. Direct table lookup fallback if RPC is pending migration
      const { data: tableData, error: tableError } = await supabase
        .from('staff_profiles')
        .select('*')
        .ilike('email', email)
        .eq('is_active', true)
        .maybeSingle();

      if (!tableError && tableData) {
        // Map Google UID
        try {
          await supabase
            .from('staff_profiles')
            .update({
              auth_user_id: authUser.id,
              name: userName || tableData.name,
              avatar_url: avatarUrl || tableData.avatar_url,
              last_login_at: new Date().toISOString()
            })
            .eq('id', tableData.id);
        } catch (e) { }

        const role = tableData.role as StaffRole;
        const staff: StaffProfile = {
          id: tableData.id,
          authUserId: authUser.id,
          email: tableData.email,
          name: userName || tableData.name,
          role,
          avatarUrl: avatarUrl || tableData.avatar_url,
          isActive: true,
          permissions: (tableData.permissions as StaffPermissions) || getDefaultPermissions(role),
          lastLoginAt: new Date().toISOString()
        };

        this.setSession(staff);
        return { authorized: true, staff };
      }

      // 3. Check local directory fallback (e.g. offline or during initial setup)
      const localDirectory = this.getStaffDirectory();
      const localMatch = localDirectory.find(s => s.email.toLowerCase() === email && s.isActive);
      if (localMatch) {
        const staff: StaffProfile = {
          ...localMatch,
          authUserId: authUser.id,
          name: userName || localMatch.name,
          avatarUrl: avatarUrl || localMatch.avatarUrl,
          permissions: localMatch.permissions || getDefaultPermissions(localMatch.role),
          lastLoginAt: new Date().toISOString()
        };
        this.setSession(staff);
        return { authorized: true, staff };
      }

      // If no match found anywhere: block access!
      return {
        authorized: false,
        message: `Unauthorized account. The Google account (${email}) is not registered as an authorized staff member. Please contact your restaurant admin.`
      };
    } catch (err: any) {
      // Fallback check local directory
      const localDirectory = this.getStaffDirectory();
      const localMatch = localDirectory.find(s => s.email.toLowerCase() === email && s.isActive);
      if (localMatch) {
        this.setSession(localMatch);
        return { authorized: true, staff: localMatch };
      }

      return {
        authorized: false,
        message: `Authentication verification failed: ${err.message || 'Unknown error'}`
      };
    }
  }

  private setSession(staff: StaffProfile) {
    this.currentStaff = staff;
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF, JSON.stringify(staff));
    } catch (e) { }
    this.notify();
  }

  public async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) { }
    this.currentStaff = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF);
    } catch (e) { }
    this.notify();
  }

  // Set up auth state listener for OAuth redirects and token refresh
  private async initAuthListener() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      // Check if URL has OAuth callback hash/tokens
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        // If we already have a staff session matching, keep it; otherwise verify
        if (!this.currentStaff || this.currentStaff.email.toLowerCase() !== sessionData.session.user.email?.toLowerCase()) {
          const result = await this.verifyAndLinkStaffProfile(sessionData.session.user);
          if (!result.authorized) {
            await this.signOut();
          }
        }
      }

      // Listen for future auth state changes (e.g. OAuth redirect return, sign in, sign out)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const result = await this.verifyAndLinkStaffProfile(session.user);
          if (!result.authorized) {
            await this.signOut();
          }
        } else if (event === 'SIGNED_OUT') {
          this.currentStaff = null;
          try {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF);
          } catch (e) { }
          this.notify();
        }
      });
    } catch (e) { }
  }
}

export const authService = new AuthService();
