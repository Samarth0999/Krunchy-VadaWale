# Chav Scaler (चव प्रमाणक) - Bilingual Recipe Scaler with Firebase Cloud Firestore

A mobile-responsive web app designed with a native mobile app UI for scaling recipes in real-time with instant **English ⇄ Marathi (मराठी)** bilingual translation and **Firebase Cloud Firestore** integration.

---

## 🌟 Key Features

### 1. 🌐 Instant Bilingual Support (English & मराठी)
- One-tap toggle button in the top app bar switches the entire UI instantly.
- UI elements, navigation tabs, category chips, recipe titles, descriptions, chef tips, cooking steps, and ingredient names change on the fly without page reload.
- Dual-language subtitle hints so home cooks can learn both Marathi and English culinary terminology.

### 2. ⚡ Real-Time Servings Multiplier Engine
- **Base Servings Reference**: Clearly shows original recipe base servings.
- **Quick Preset Pills**: Tap `1`, `2`, `4`, `6`, or `8` servings for instant scaling.
- **Custom Stepper & Decimal Input**:
  - `[-]` and `[+]` stepper buttons (+/- 0.5 serving adjustments).
  - Tap-to-type custom decimal values (e.g., `1.5`, `2.5`, `3.5`, `10`).
- **Real-Time Multiplication**: Every ingredient quantity multiplies automatically using `(base_qty * target_servings) / base_servings`.
- **Culinary Fractions & Decimals**: Toggle between culinary fractions (e.g. `1 ½`, `¾`, `¼`) and clean decimals (`1.5`, `0.75`, `0.25`).
- **Scale Badge**: Displays current multiplier factor (e.g. `2x`, `0.75x`, `1.5x`).
- **Reset to Base**: Reverts to original recipe servings with one tap.

### 3. 🍲 Preloaded Authentic Maharashtrian Recipes
Works 100% out-of-the-box with six authentic recipes:
1. **Kanda Poha (खमंग कांदे पोहे / कांदा पोहा)** – Classic breakfast with poha, peanuts, mustard tempering, onions, fresh coconut, and lemon.
2. **Special Kadak Chai (स्पेशल आले-गवती फक्कड चहा)** – Spiced tea with crushed ginger, lemongrass, cardamom, and full-fat milk.
3. **Kolhapuri Kat Misal Pav (झणझणीत कोल्हापुरी कट मिसळ पाव)** – Moth beans rassa, spicy tarri kat, crunchy farsan, and ladi pav.
4. **Traditional Puran Poli (पारंपारिक मऊ लुसलुशीत पुरणपोळी)** – Chana dal and jaggery filling flavored with nutmeg-cardamom and pure ghee.
5. **Krunchy Mumbai Batata Vada (गरमागरम कुरकुरीत बटाटा वडा)** – Golden besan coated potato vadas with spicy garlic chutney.
6. **Fluffy Upwas Sabudana Khichdi (मोकळी दाणेदार साबुदाणा खिचडी)** – Fasting tapioca pearls with roasted peanut powder, cumin, and green chillies.

### 4. 🔥 Firebase Cloud Firestore Integration
- Modular Firebase v10 Web SDK integration (`collection`, `onSnapshot`, `addDoc`, `deleteDoc`).
- **Dynamic Recipe Creation Form**:
  - Add custom recipes with English and Marathi titles, descriptions, categories, base servings, prep time, and cook time.
  - Dynamic ingredient builder: English Name, Marathi Name, Base Quantity, and Units.
  - Dynamic cooking steps builder with dual-language fields.
  - Saves directly to Cloud Firestore.
- **In-App Cloud Settings Modal**:
  - Input custom Firebase project credentials (`apiKey`, `projectId`, `appId`, etc.) directly from the UI without editing code. Credentials persist in `localStorage`.
  - **1-Click Seed Button**: Upload all preloaded authentic recipes into your Cloud Firestore collection with a single click.
  - Graceful fallback: Operates seamlessly in local offline mode if credentials are not yet entered.

### 5. 📱 Mobile-First UI & Cooking Utilities
- **Native Mobile Experience**: Designed with a smartphone frame container, top dynamic island/notch, and bottom navigation bar.
- **Desktop Wide View Switcher**: Toggle between 430px smartphone frame and wide responsive view on desktop screens.
- **Interactive Checklist Mode**: Tap ingredients to check them off as you shop or cook, with strikethrough styling and checklist reset.
- **Copy Scaled List**: Formats all scaled quantities and ingredient names and copies them to the clipboard with celebratory confetti.

---

## 🚀 Running the Project

### Development Server
```bash
cd recipe-scaler
npm run dev
```
The app will be accessible at: `http://localhost:5173/`

### Production Build
```bash
cd recipe-scaler
npm run build
npm run preview
```
