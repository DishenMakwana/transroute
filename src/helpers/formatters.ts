/**
 * Centralized formatting and domain helpers for TransRoute
 */

/**
 * Formats a numeric price into standard Indian Rupee format
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Checks if a logistics facility is currently open based on Indian Standard Time (IST - UTC+5:30)
 */
export function checkIsOpenNow(start: string, end: string): boolean {
  try {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = (utcMinutes + 330) % 1440;

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal <= endTotal) {
      return istMinutes >= startTotal && istMinutes <= endTotal;
    }
    // Overnight facility
    return istMinutes >= startTotal || istMinutes <= endTotal;
  } catch {
    return true;
  }
}

/**
 * Cleans and formats Indian 6-digit postal PIN codes
 */
export function formatPinCode(pin: string): string {
  const digits = pin.replace(/\D/g, "");
  return digits.slice(0, 6);
}

/**
 * Returns human-readable label for weight units
 */
export function getWeightUnitLabel(unit: string): string {
  switch (unit) {
    case "kg":
      return "Kilogram (kg)";
    case "g":
      return "Gram (g)";
    case "quintal":
      return "Quintal (100 kg)";
    case "tonne":
      return "Metric Tonne (MT)";
    default:
      return unit;
  }
}

/**
 * Returns human-readable label for box carton units
 */
export function getBoxUnitLabel(unit: string): string {
  switch (unit) {
    case "small_box":
      return "Small Box (<8 kg)";
    case "medium_box":
      return "Medium Box (<25 kg)";
    case "large_box":
      return "Large Box (<50 kg)";
    case "per_cft":
      return "Per Cubic Foot (CFT)";
    case "per_cbm":
      return "Per Cubic Meter (CBM)";
    default:
      return unit;
  }
}
