export type Currency = {
  code: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  aliases: string[];
};

function flagFromCountry(iso2: string) {
  if (iso2 === "EU") return "🇪🇺";
  return String.fromCodePoint(...[...iso2.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)));
}

function entry(
  code: string,
  name: string,
  country: string,
  countryCode: string,
  aliases: string[] = [],
): Currency {
  return { code, name, country, countryCode, flag: flagFromCountry(countryCode), aliases };
}

/** Major ISO 4217 currencies shown in the converter. Rates still come from the live API. */
export const CURRENCIES: Currency[] = [
  entry("USD", "US Dollar", "United States", "US", ["dollar", "bucks", "america"]),
  entry("EUR", "Euro", "Eurozone", "EU", ["euro"]),
  entry("GBP", "British Pound", "United Kingdom", "GB", ["pound", "sterling", "uk"]),
  entry("INR", "Indian Rupee", "India", "IN", ["rupee", "india"]),
  entry("JPY", "Japanese Yen", "Japan", "JP", ["yen"]),
  entry("CNY", "Chinese Yuan", "China", "CN", ["rmb", "yuan", "renminbi"]),
  entry("AUD", "Australian Dollar", "Australia", "AU", ["aussie"]),
  entry("CAD", "Canadian Dollar", "Canada", "CA", ["loonie"]),
  entry("CHF", "Swiss Franc", "Switzerland", "CH", ["franc"]),
  entry("HKD", "Hong Kong Dollar", "Hong Kong", "HK"),
  entry("SGD", "Singapore Dollar", "Singapore", "SG"),
  entry("NZD", "New Zealand Dollar", "New Zealand", "NZ", ["kiwi"]),
  entry("KRW", "South Korean Won", "South Korea", "KR", ["won"]),
  entry("SEK", "Swedish Krona", "Sweden", "SE"),
  entry("NOK", "Norwegian Krone", "Norway", "NO"),
  entry("DKK", "Danish Krone", "Denmark", "DK"),
  entry("PLN", "Polish Zloty", "Poland", "PL"),
  entry("CZK", "Czech Koruna", "Czechia", "CZ"),
  entry("HUF", "Hungarian Forint", "Hungary", "HU"),
  entry("RON", "Romanian Leu", "Romania", "RO"),
  entry("BGN", "Bulgarian Lev", "Bulgaria", "BG"),
  entry("MXN", "Mexican Peso", "Mexico", "MX", ["peso"]),
  entry("BRL", "Brazilian Real", "Brazil", "BR", ["real"]),
  entry("ARS", "Argentine Peso", "Argentina", "AR"),
  entry("CLP", "Chilean Peso", "Chile", "CL"),
  entry("COP", "Colombian Peso", "Colombia", "CO"),
  entry("PEN", "Peruvian Sol", "Peru", "PE"),
  entry("ZAR", "South African Rand", "South Africa", "ZA", ["rand"]),
  entry("TRY", "Turkish Lira", "Turkey", "TR"),
  entry("RUB", "Russian Ruble", "Russia", "RU"),
  entry("UAH", "Ukrainian Hryvnia", "Ukraine", "UA"),
  entry("ILS", "Israeli Shekel", "Israel", "IL"),
  entry("AED", "UAE Dirham", "United Arab Emirates", "AE", ["dirham", "dubai", "uae"]),
  entry("SAR", "Saudi Riyal", "Saudi Arabia", "SA", ["riyal"]),
  entry("QAR", "Qatari Riyal", "Qatar", "QA"),
  entry("KWD", "Kuwaiti Dinar", "Kuwait", "KW"),
  entry("BHD", "Bahraini Dinar", "Bahrain", "BH"),
  entry("OMR", "Omani Rial", "Oman", "OM"),
  entry("EGP", "Egyptian Pound", "Egypt", "EG"),
  entry("MAD", "Moroccan Dirham", "Morocco", "MA"),
  entry("NGN", "Nigerian Naira", "Nigeria", "NG", ["naira"]),
  entry("KES", "Kenyan Shilling", "Kenya", "KE"),
  entry("GHS", "Ghanaian Cedi", "Ghana", "GH"),
  entry("THB", "Thai Baht", "Thailand", "TH", ["baht"]),
  entry("IDR", "Indonesian Rupiah", "Indonesia", "ID"),
  entry("MYR", "Malaysian Ringgit", "Malaysia", "MY"),
  entry("PHP", "Philippine Peso", "Philippines", "PH"),
  entry("VND", "Vietnamese Dong", "Vietnam", "VN"),
  entry("TWD", "New Taiwan Dollar", "Taiwan", "TW"),
  entry("PKR", "Pakistani Rupee", "Pakistan", "PK"),
  entry("BDT", "Bangladeshi Taka", "Bangladesh", "BD", ["taka"]),
  entry("LKR", "Sri Lankan Rupee", "Sri Lanka", "LK"),
  entry("NPR", "Nepalese Rupee", "Nepal", "NP"),
  entry("MMK", "Myanmar Kyat", "Myanmar", "MM"),
  entry("KHR", "Cambodian Riel", "Cambodia", "KH"),
  entry("BND", "Brunei Dollar", "Brunei", "BN"),
  entry("FJD", "Fijian Dollar", "Fiji", "FJ"),
  entry("MUR", "Mauritian Rupee", "Mauritius", "MU"),
  entry("JOD", "Jordanian Dinar", "Jordan", "JO"),
  entry("ISK", "Icelandic Krona", "Iceland", "IS"),
  entry("BAM", "Bosnia-Herzegovina Mark", "Bosnia and Herzegovina", "BA"),
  entry("RSD", "Serbian Dinar", "Serbia", "RS"),
  entry("GEL", "Georgian Lari", "Georgia", "GE"),
  entry("KZT", "Kazakhstani Tenge", "Kazakhstan", "KZ"),
  entry("UZS", "Uzbekistani Som", "Uzbekistan", "UZ"),
  entry("CRC", "Costa Rican Colon", "Costa Rica", "CR"),
  entry("UYU", "Uruguayan Peso", "Uruguay", "UY"),
  entry("TZS", "Tanzanian Shilling", "Tanzania", "TZ"),
  entry("UGX", "Ugandan Shilling", "Uganda", "UG"),
  entry("XOF", "West African CFA Franc", "West Africa", "SN", ["cfa", "senegal"]),
  entry("XAF", "Central African CFA Franc", "Central Africa", "CM", ["cfa", "cameroon"]),
];

const byCode = new Map(CURRENCIES.map((item) => [item.code, item]));

export const POPULAR_PAIRS: Array<{ from: string; to: string; label: string }> = [
  { from: "USD", to: "INR", label: "USD → INR" },
  { from: "EUR", to: "USD", label: "EUR → USD" },
  { from: "GBP", to: "USD", label: "GBP → USD" },
  { from: "USD", to: "AED", label: "USD → AED" },
  { from: "USD", to: "EUR", label: "USD → EUR" },
  { from: "AUD", to: "USD", label: "AUD → USD" },
  { from: "USD", to: "JPY", label: "USD → JPY" },
  { from: "INR", to: "USD", label: "INR → USD" },
];

export const DEFAULT_FROM = "USD";
export const DEFAULT_TO = "INR";
export const DEFAULT_AMOUNT = "100";

export function getCurrency(code: string) {
  return byCode.get(code.toUpperCase()) ?? null;
}

export function currencyLabel(code: string) {
  const item = getCurrency(code);
  return item ? `${item.flag} ${item.code} · ${item.name}` : code;
}

export function filterCurrencies(query: string, available?: Set<string>) {
  const needle = query.trim().toLowerCase();
  return CURRENCIES.filter((item) => {
    if (available && !available.has(item.code)) return false;
    if (!needle) return true;
    const hay = `${item.code} ${item.name} ${item.country} ${item.aliases.join(" ")}`.toLowerCase();
    return hay.includes(needle);
  });
}
