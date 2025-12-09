/**
 * Currency Utilities
 * Centralized currency formatting and conversion system
 */

export type CurrencyCode = 'USD' | 'KES' | 'RWF' | 'UGX' | 'TZS' | 'ETB';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimalPlaces: number;
}

// Currency configurations
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimalPlaces: 2 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE', decimalPlaces: 2 },
  RWF: { code: 'RWF', symbol: 'RF', name: 'Rwandan Franc', locale: 'en-RW', decimalPlaces: 0 },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', locale: 'en-UG', decimalPlaces: 0 },
  TZS: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', locale: 'en-TZ', decimalPlaces: 2 },
  ETB: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', locale: 'en-ET', decimalPlaces: 2 },
};

// Country to currency mapping
export const COUNTRY_CURRENCIES: Record<string, CurrencyCode> = {
  'RW': 'RWF',
  'KE': 'KES',
  'UG': 'UGX',
  'TZ': 'TZS',
  'ET': 'ETB',
  'US': 'USD',
};

// Exchange rates (approximate - should be fetched from API in production)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  KES: 130.0,  // 1 USD = 130 KES
  RWF: 1300.0, // 1 USD = 1300 RWF
  UGX: 3700.0, // 1 USD = 3700 UGX
  TZS: 2300.0, // 1 USD = 2300 TZS
  ETB: 55.0,   // 1 USD = 55 ETB
};

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: {
    showSymbol?: boolean;
    compact?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const config = CURRENCIES[currency];
  if (!config) {
    console.warn(`Unknown currency: ${currency}, defaulting to USD`);
    return formatCurrency(amount, 'USD', options);
  }

  const {
    showSymbol = true,
    compact = false,
    minimumFractionDigits = config.decimalPlaces,
    maximumFractionDigits = config.decimalPlaces,
  } = options || {};

  if (compact && amount >= 1000000) {
    const millions = amount / 1000000;
    return `${showSymbol ? config.symbol : ''}${millions.toFixed(1)}M`;
  } else if (compact && amount >= 1000) {
    const thousands = amount / 1000;
    return `${showSymbol ? config.symbol : ''}${thousands.toFixed(1)}K`;
  }

  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });

    if (showSymbol) {
      return formatter.format(amount);
    } else {
      // For non-currency formatting, we need to manually add the symbol
      const formatted = formatter.format(amount);
      return `${config.symbol} ${formatted}`;
    }
  } catch (error) {
    // Fallback formatting
    const formatted = amount.toLocaleString(config.locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });
    return showSymbol ? `${config.symbol}${formatted}` : formatted;
  }
}

/**
 * Convert currency amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Get currency for a country code
 */
export function getCountryCurrency(countryCode: string): CurrencyCode {
  return COUNTRY_CURRENCIES[countryCode.toUpperCase()] || 'USD';
}

/**
 * Format currency with country context
 */
export function formatCurrencyForCountry(
  amount: number,
  countryCode: string,
  options?: Parameters<typeof formatCurrency>[2]
): string {
  const currency = getCountryCurrency(countryCode);
  return formatCurrency(amount, currency, options);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string, currency: CurrencyCode = 'USD'): number {
  const config = CURRENCIES[currency];
  if (!config) return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;

  // Remove currency symbols and spaces
  const cleaned = value
    .replace(new RegExp(config.symbol, 'gi'), '')
    .replace(/[^\d.-]/g, '')
    .trim();

  return parseFloat(cleaned) || 0;
}


