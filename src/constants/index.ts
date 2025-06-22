export const COLORS = {
  primary: '#aa5c2f',
  primaryHover: '#8b4a26',
  primaryLight: '#c4723f',
  primaryDark: '#7a3f20',
  text: '#010101',
  textSecondary: '#4a5568',
  background: '#f9f7f3',
  backgroundDark: '#0f0f0f',
  backgroundSecondary: '#ffffff',
  backgroundSecondaryDark: '#1a1a1a',
  border: '#e2e8f0',
  borderDark: '#2d3748',
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const PLANS = {
  FREE: {
    name: 'Gratuit',
    price: 0,
    queries: 5,
    features: [
      '5 requêtes IA par jour',
      'Accès partiel à la bibliothèque juridique',
      'Modèles de base (contrats simples)',
      'Analyse de documents limitée',
      'Support communautaire'
    ]
  },
  PREMIUM: {
    name: 'Premium',
    price: 5000,
    queries: -1, // unlimited
    features: [
      'Requêtes IA illimitées',
      'Lecture audio IA des textes juridiques',
      'Accès complet à tous les modèles',
      'Analyse avancée de documents',
      'Historique complet des conversations',
      'Export PDF des consultations',
      'Support prioritaire 24/7',
      'Notifications juridiques personnalisées'
    ]
  }
};

export const LANGUAGES = {
  FR: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  EN: { code: 'en', name: 'English', flag: '🇬🇧' }
};

export const LEGAL_CATEGORIES = [
  'Droit commercial général',
  'Droit des sociétés commerciales',
  'Droit du travail et sécurité sociale',
  'Droit civil et procédures civiles',
  'Droit pénal et procédures pénales',
  'Droit administratif et fiscal',
  'Droit bancaire et financier',
  'Droit de la propriété intellectuelle',
  'Droit de l\'arbitrage',
  'Droit des transports'
];

export const TEMPLATE_CATEGORIES = [
  'Contrats commerciaux',
  'Documents RH et travail',
  'Procédures civiles et pénales',
  'Actes de société et statuts',
  'Baux et locations immobilières',
  'Mises en demeure et recouvrement',
  'Procédures d\'arbitrage',
  'Documents bancaires et financiers'
];

export const OHADA_COUNTRIES = [
  { name: 'Bénin', flag: '🇧🇯', code: 'BJ' },
  { name: 'Burkina Faso', flag: '🇧🇫', code: 'BF' },
  { name: 'Cameroun', flag: '🇨🇲', code: 'CM' },
  { name: 'Centrafrique', flag: '🇨🇫', code: 'CF' },
  { name: 'Comores', flag: '🇰🇲', code: 'KM' },
  { name: 'Congo', flag: '🇨🇬', code: 'CG' },
  { name: 'RD Congo', flag: '🇨🇩', code: 'CD' },
  { name: 'Côte d\'Ivoire', flag: '🇨🇮', code: 'CI' },
  { name: 'Gabon', flag: '🇬🇦', code: 'GA' },
  { name: 'Guinée', flag: '🇬🇳', code: 'GN' },
  { name: 'Guinée-Bissau', flag: '🇬🇼', code: 'GW' },
  { name: 'Guinée Équatoriale', flag: '🇬🇶', code: 'GQ' },
  { name: 'Mali', flag: '🇲🇱', code: 'ML' },
  { name: 'Niger', flag: '🇳🇪', code: 'NE' },
  { name: 'Sénégal', flag: '🇸🇳', code: 'SN' },
  { name: 'Tchad', flag: '🇹🇩', code: 'TD' },
  { name: 'Togo', flag: '🇹🇬', code: 'TG' }
];

export const LEGAL_ACTS = [
  'Acte uniforme relatif au droit commercial général',
  'Acte uniforme relatif au droit des sociétés commerciales et du groupement d\'intérêt économique',
  'Acte uniforme relatif au droit des sûretés',
  'Acte uniforme portant organisation des procédures simplifiées de recouvrement et des voies d\'exécution',
  'Acte uniforme portant organisation des procédures collectives d\'apurement du passif',
  'Acte uniforme relatif au droit de l\'arbitrage',
  'Acte uniforme relatif au droit du travail',
  'Acte uniforme relatif au droit comptable et à l\'information financière',
  'Acte uniforme relatif aux contrats de transport de marchandises par route'
];