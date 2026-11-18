// Precision Recipe Scaling & Culinary Fraction Engine

/**
 * Scales a base quantity based on target servings vs base servings.
 * @param {number} baseQty 
 * @param {number} baseServings 
 * @param {number} targetServings 
 * @returns {number}
 */
export function calculateScaledQty(baseQty, baseServings, targetServings) {
  if (!baseQty || isNaN(baseQty) || !baseServings || !targetServings) {
    return 0;
  }
  const ratio = targetServings / baseServings;
  const scaled = baseQty * ratio;
  // Round to 3 decimal places to prevent floating point imprecision
  return Math.round(scaled * 1000) / 1000;
}

// Convert vulgar fraction to unicode symbols
const FRACTION_MAP = [
  { val: 0.125, symbol: "⅛", tolerance: 0.03 },
  { val: 0.25, symbol: "¼", tolerance: 0.04 },
  { val: 0.333, symbol: "⅓", tolerance: 0.04 },
  { val: 0.375, symbol: "⅜", tolerance: 0.03 },
  { val: 0.5, symbol: "½", tolerance: 0.04 },
  { val: 0.625, symbol: "⅝", tolerance: 0.03 },
  { val: 0.666, symbol: "⅔", tolerance: 0.04 },
  { val: 0.75, symbol: "¾", tolerance: 0.04 },
  { val: 0.875, symbol: "⅞", tolerance: 0.03 },
];

/**
 * Formats a scaled number as a clean fraction or clean decimal.
 * @param {number} num 
 * @param {boolean} useFractions 
 * @param {string} lang 
 * @returns {string}
 */
export function formatQuantity(num, useFractions = true, lang = 'en') {
  if (num === 0 || isNaN(num)) return "0";

  // Check if it's virtually an integer
  const nearestInt = Math.round(num);
  if (Math.abs(num - nearestInt) < 0.02) {
    return lang === 'mr' ? toMarathiDigits(nearestInt) : nearestInt.toString();
  }

  if (useFractions) {
    const whole = Math.floor(num);
    const remainder = num - whole;

    // Check if remainder is close to 1
    if (remainder > 0.96) {
      const res = whole + 1;
      return lang === 'mr' ? toMarathiDigits(res) : res.toString();
    }

    for (const f of FRACTION_MAP) {
      if (Math.abs(remainder - f.val) <= f.tolerance) {
        if (whole === 0) {
          return f.symbol;
        }
        const wholeStr = lang === 'mr' ? toMarathiDigits(whole) : whole.toString();
        return `${wholeStr} ${f.symbol}`;
      }
    }
  }

  // Fallback to clean decimal (max 2 decimals, strip trailing zeros)
  const formattedDec = Number(num.toFixed(2)).toString();
  return lang === 'mr' ? toMarathiDigits(formattedDec) : formattedDec;
}

/**
 * Converts Western digits 0-9 to Devanagari / Marathi numerals
 */
export function toMarathiDigits(val) {
  if (val === null || val === undefined) return "";
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return val.toString().replace(/\d/g, (d) => marathiDigits[parseInt(d, 10)]);
}

/**
 * Calculates the multiplier badge string (e.g. "1.5x")
 */
export function getScaleMultiplier(baseServings, targetServings) {
  if (!baseServings || !targetServings) return "1x";
  const factor = targetServings / baseServings;
  const rounded = Math.round(factor * 100) / 100;
  return `${rounded}x`;
}
