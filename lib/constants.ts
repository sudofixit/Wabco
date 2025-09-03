export const BODY_TYPES = [
    'HATCHBACK',
    'SEDAN',
    'SUV',
    'MUV',
    'COUPE',
    'CONVERTIBLE',
    'PICKUP'
] as const;

export const FUEL_TYPES = [
    'PETROL',
    'DIESEL',
    'ELECTRIC',
    'HYBRID',
    'CNG'
] as const;

export const TRANSMISSION_TYPES = [
    'MANUAL',
    'AUTOMATIC',
    'CVT',
    'DCT'
] as const;

export const STOCK_STATUS_OPTIONS = [
    'IN_STOCK',
    'COMING_SOON',
    'OUT_OF_STOCK',
    'PRE_ORDER'
] as const;

export const PRICE_RANGE_OPTIONS = [
    { label: "Under KES 1M", value: "0-1000000" },
    { label: "KES 1M - 2M", value: "1000000-2000000" },
    { label: "KES 2M - 3M", value: "2000000-3000000" },
    { label: "KES 3M - 5M", value: "3000000-5000000" },
    { label: "Over KES 5M", value: "5000000-10000000" }
] as const;

export const MILEAGE_RANGE_OPTIONS = [
    { label: "Under 10 kmpl", value: "0-10" },
    { label: "10 - 15 kmpl", value: "10-15" },
    { label: "15 - 20 kmpl", value: "15-20" },
    { label: "20 - 25 kmpl", value: "20-25" },
    { label: "Over 25 kmpl", value: "25-50" }
] as const;

interface CountryCode {
    code: string;
    dialCode: string;
    name: string;
    flag: string;
}

const countryCodes: CountryCode[] = [
    // Middle East
    { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'QA', dialCode: '+974', name: 'Qatar', flag: '🇶🇦' },
    { code: 'KW', dialCode: '+965', name: 'Kuwait', flag: '🇰🇼' },
    { code: 'BH', dialCode: '+973', name: 'Bahrain', flag: '🇧🇭' },
    { code: 'OM', dialCode: '+968', name: 'Oman', flag: '🇴🇲' },
    { code: 'JO', dialCode: '+962', name: 'Jordan', flag: '🇯🇴' },
    { code: 'LB', dialCode: '+961', name: 'Lebanon', flag: '🇱🇧' },
    { code: 'IQ', dialCode: '+964', name: 'Iraq', flag: '🇮🇶' },
    { code: 'IR', dialCode: '+98', name: 'Iran', flag: '🇮🇷' },
    { code: 'IL', dialCode: '+972', name: 'Israel', flag: '🇮🇱' },
    { code: 'SY', dialCode: '+963', name: 'Syria', flag: '🇸🇾' },
    { code: 'YE', dialCode: '+967', name: 'Yemen', flag: '🇾🇪' },

    // North America
    { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
    { code: 'MX', dialCode: '+52', name: 'Mexico', flag: '🇲🇽' },

    // Europe
    { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
    { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'BE', dialCode: '+32', name: 'Belgium', flag: '🇧🇪' },
    { code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'AT', dialCode: '+43', name: 'Austria', flag: '🇦🇹' },
    { code: 'SE', dialCode: '+46', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NO', dialCode: '+47', name: 'Norway', flag: '🇳🇴' },
    { code: 'DK', dialCode: '+45', name: 'Denmark', flag: '🇩🇰' },
    { code: 'FI', dialCode: '+358', name: 'Finland', flag: '🇫🇮' },
    { code: 'IE', dialCode: '+353', name: 'Ireland', flag: '🇮🇪' },
    { code: 'PT', dialCode: '+351', name: 'Portugal', flag: '🇵🇹' },
    { code: 'GR', dialCode: '+30', name: 'Greece', flag: '🇬🇷' },
    { code: 'PL', dialCode: '+48', name: 'Poland', flag: '🇵🇱' },
    { code: 'CZ', dialCode: '+420', name: 'Czech Republic', flag: '🇨🇿' },
    { code: 'HU', dialCode: '+36', name: 'Hungary', flag: '🇭🇺' },
    { code: 'RO', dialCode: '+40', name: 'Romania', flag: '🇷🇴' },
    { code: 'BG', dialCode: '+359', name: 'Bulgaria', flag: '🇧🇬' },
    { code: 'HR', dialCode: '+385', name: 'Croatia', flag: '🇭🇷' },
    { code: 'RS', dialCode: '+381', name: 'Serbia', flag: '🇷🇸' },
    { code: 'UA', dialCode: '+380', name: 'Ukraine', flag: '🇺🇦' },
    { code: 'RU', dialCode: '+7', name: 'Russia', flag: '🇷🇺' },
    { code: 'TR', dialCode: '+90', name: 'Turkey', flag: '🇹🇷' },

    // Asia
    { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
    { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩' },
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: 'NP', dialCode: '+977', name: 'Nepal', flag: '🇳🇵' },
    { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
    { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: 'TH', dialCode: '+66', name: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: 'ID', dialCode: '+62', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'PH', dialCode: '+63', name: 'Philippines', flag: '🇵🇭' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia', flag: '🇰🇭' },
    { code: 'LA', dialCode: '+856', name: 'Laos', flag: '🇱🇦' },
    { code: 'MM', dialCode: '+95', name: 'Myanmar', flag: '🇲🇲' },
    { code: 'BN', dialCode: '+673', name: 'Brunei', flag: '🇧🇳' },
    { code: 'MN', dialCode: '+976', name: 'Mongolia', flag: '🇲🇳' },
    { code: 'KZ', dialCode: '+7', name: 'Kazakhstan', flag: '🇰🇿' },
    { code: 'UZ', dialCode: '+998', name: 'Uzbekistan', flag: '🇺🇿' },
    { code: 'AF', dialCode: '+93', name: 'Afghanistan', flag: '🇦🇫' },

    // Africa
    { code: 'EG', dialCode: '+20', name: 'Egypt', flag: '🇪🇬' },
    { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: 'NG', dialCode: '+234', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'KE', dialCode: '+254', name: 'Kenya', flag: '🇰🇪' },
    { code: 'GH', dialCode: '+233', name: 'Ghana', flag: '🇬🇭' },
    { code: 'ET', dialCode: '+251', name: 'Ethiopia', flag: '🇪🇹' },
    { code: 'UG', dialCode: '+256', name: 'Uganda', flag: '🇺🇬' },
    { code: 'TZ', dialCode: '+255', name: 'Tanzania', flag: '🇹🇿' },
    { code: 'MA', dialCode: '+212', name: 'Morocco', flag: '🇲🇦' },
    { code: 'DZ', dialCode: '+213', name: 'Algeria', flag: '🇩🇿' },
    { code: 'TN', dialCode: '+216', name: 'Tunisia', flag: '🇹🇳' },
    { code: 'LY', dialCode: '+218', name: 'Libya', flag: '🇱🇾' },
    { code: 'SD', dialCode: '+249', name: 'Sudan', flag: '🇸🇩' },
    { code: 'ZW', dialCode: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
    { code: 'ZM', dialCode: '+260', name: 'Zambia', flag: '🇿🇲' },
    { code: 'BW', dialCode: '+267', name: 'Botswana', flag: '🇧🇼' },
    { code: 'NA', dialCode: '+264', name: 'Namibia', flag: '🇳🇦' },
    { code: 'RW', dialCode: '+250', name: 'Rwanda', flag: '🇷🇼' },
    { code: 'SN', dialCode: '+221', name: 'Senegal', flag: '🇸🇳' },
    { code: 'CI', dialCode: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: 'ML', dialCode: '+223', name: 'Mali', flag: '🇲🇱' },
    { code: 'BF', dialCode: '+226', name: 'Burkina Faso', flag: '🇧🇫' },

    // Oceania
    { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'FJ', dialCode: '+679', name: 'Fiji', flag: '🇫🇯' },
    { code: 'PG', dialCode: '+675', name: 'Papua New Guinea', flag: '🇵🇬' },

    // South America
    { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: 'AR', dialCode: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CL', dialCode: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: 'PE', dialCode: '+51', name: 'Peru', flag: '🇵🇪' },
    { code: 'CO', dialCode: '+57', name: 'Colombia', flag: '🇨🇴' },
    { code: 'VE', dialCode: '+58', name: 'Venezuela', flag: '🇻🇪' },
    { code: 'EC', dialCode: '+593', name: 'Ecuador', flag: '🇪🇨' },
    { code: 'BO', dialCode: '+591', name: 'Bolivia', flag: '🇧🇴' },
    { code: 'UY', dialCode: '+598', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'PY', dialCode: '+595', name: 'Paraguay', flag: '🇵🇾' },
    { code: 'GY', dialCode: '+592', name: 'Guyana', flag: '🇬🇾' },
    { code: 'SR', dialCode: '+597', name: 'Suriname', flag: '🇸🇷' },

    // Central America & Caribbean
    { code: 'GT', dialCode: '+502', name: 'Guatemala', flag: '🇬🇹' },
    { code: 'CR', dialCode: '+506', name: 'Costa Rica', flag: '🇨🇷' },
    { code: 'PA', dialCode: '+507', name: 'Panama', flag: '🇵🇦' },
    { code: 'NI', dialCode: '+505', name: 'Nicaragua', flag: '🇳🇮' },
    { code: 'HN', dialCode: '+504', name: 'Honduras', flag: '🇭🇳' },
    { code: 'SV', dialCode: '+503', name: 'El Salvador', flag: '🇸🇻' },
    { code: 'BZ', dialCode: '+501', name: 'Belize', flag: '🇧🇿' },
    { code: 'JM', dialCode: '+1876', name: 'Jamaica', flag: '🇯🇲' },
    { code: 'CU', dialCode: '+53', name: 'Cuba', flag: '🇨🇺' },
    { code: 'DO', dialCode: '+1', name: 'Dominican Republic', flag: '🇩🇴' },
    { code: 'HT', dialCode: '+509', name: 'Haiti', flag: '🇭🇹' },
    { code: 'PR', dialCode: '+1', name: 'Puerto Rico', flag: '🇵🇷' },
    { code: 'TT', dialCode: '+1868', name: 'Trinidad and Tobago', flag: '🇹🇹' },
    { code: 'BB', dialCode: '+1246', name: 'Barbados', flag: '🇧🇧' },

    // Additional Asian Countries
    { code: 'HK', dialCode: '+852', name: 'Hong Kong', flag: '🇭🇰' },
    { code: 'MO', dialCode: '+853', name: 'Macau', flag: '🇲🇴' },
    { code: 'TW', dialCode: '+886', name: 'Taiwan', flag: '🇹🇼' },
    { code: 'AM', dialCode: '+374', name: 'Armenia', flag: '🇦🇲' },
    { code: 'AZ', dialCode: '+994', name: 'Azerbaijan', flag: '🇦🇿' },
    { code: 'GE', dialCode: '+995', name: 'Georgia', flag: '🇬🇪' },
    { code: 'KG', dialCode: '+996', name: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: 'TJ', dialCode: '+992', name: 'Tajikistan', flag: '🇹🇯' },
    { code: 'TM', dialCode: '+993', name: 'Turkmenistan', flag: '🇹🇲' },

];

export default countryCodes;