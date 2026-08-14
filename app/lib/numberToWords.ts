const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return "";

  let result = "";

  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }

  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }

  if (num > 0) {
    result += ones[num] + " ";
  }

  return result.trim();
}

export function numberToWords(num: number): string {
  // Round to nearest integer (assuming paise is not written in words or handled separately, we'll write "Rupees X Only")
  const value = Math.round(num);
  if (value === 0) return "Rupees Zero Only";

  let result = "";

  // Crore (1,00,00,000)
  const crore = Math.floor(value / 10000000);
  let remaining = value % 10000000;
  if (crore > 0) {
    result += convertLessThanThousand(crore) + " Crore ";
  }

  // Lakh (1,00,000)
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + " Lakh ";
  }

  // Thousand (1,000)
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + " Thousand ";
  }

  // Hundreds, Tens, Ones
  if (remaining > 0) {
    result += convertLessThanThousand(remaining) + " ";
  }

  return `Rupees ${result.replace(/\s+/g, " ").trim()} Only`;
}
