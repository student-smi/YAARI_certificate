export interface CertificateFontOption {
  name: string;
  label: string;
  category: 'Gothic & Diploma Titles' | 'Prestigious Heritage Serifs' | 'Calligraphy & Signatures' | 'Modern Corporate Sans' | 'Monospace & Credentials';
  description?: string;
}

export const CERTIFICATE_FONT_CATEGORIES = [
  'Gothic & Diploma Titles',
  'Prestigious Heritage Serifs',
  'Calligraphy & Signatures',
  'Modern Corporate Sans',
  'Monospace & Credentials'
] as const;

export const CERTIFICATE_FONTS: CertificateFontOption[] = [
  // 1. Gothic & Diploma Titles (Old English & Historical Blackletter for Traditional Diplomas)
  {
    name: 'UnifrakturMaguntia',
    label: 'UnifrakturMaguntia (Old English Gothic Diploma)',
    category: 'Gothic & Diploma Titles',
    description: 'Classic Victorian / Old English blackletter for authentic diplomas and traditional certificates'
  },
  {
    name: 'Cinzel Decorative',
    label: 'Cinzel Decorative (Imperial Royal Swash)',
    category: 'Gothic & Diploma Titles',
    description: 'Majestic Roman capital letters with decorative royal swashes'
  },
  {
    name: 'Pirata One',
    label: 'Pirata One (Vintage Blackletter)',
    category: 'Gothic & Diploma Titles',
    description: 'Bold condensed Gothic calligraphy for historic honors'
  },
  {
    name: 'MedievalSharp',
    label: 'MedievalSharp (Medieval Charter Script)',
    category: 'Gothic & Diploma Titles',
    description: 'Authentic stone and parchment charter gothic serif'
  },

  // 2. Prestigious Heritage Serifs (Academic, Diplomatic & University Degrees)
  {
    name: 'Cinzel',
    label: 'Cinzel (Diplomatic Roman Title)',
    category: 'Prestigious Heritage Serifs',
    description: 'Classical inscriptional serif inspired by first-century Roman monuments'
  },
  {
    name: 'Playfair Display',
    label: 'Playfair Display (Luxury Editorial Serif)',
    category: 'Prestigious Heritage Serifs',
    description: 'High-contrast transitional serif with classical elegance'
  },
  {
    name: 'Cormorant Garamond',
    label: 'Cormorant Garamond (Royal Academic Serif)',
    category: 'Prestigious Heritage Serifs',
    description: 'Extremely refined French Renaissance serif for official university charters'
  },
  {
    name: 'EB Garamond',
    label: 'EB Garamond (Classical Scholar Serif)',
    category: 'Prestigious Heritage Serifs',
    description: 'Standard academic and scholarly book serif for prestigious credentials'
  },
  {
    name: 'Libre Baskerville',
    label: 'Libre Baskerville (Institutional Legal Serif)',
    category: 'Prestigious Heritage Serifs',
    description: 'Trustworthy institutional serif optimized for official legal certificates'
  },
  {
    name: 'Bodoni Moda',
    label: 'Bodoni Moda (Haute Excellence Award)',
    category: 'Prestigious Heritage Serifs',
    description: 'Ultra high-contrast Italian neoclassical serif for luxury awards'
  },
  {
    name: 'Marcellus',
    label: 'Marcellus (Roman Flared Inscription)',
    category: 'Prestigious Heritage Serifs',
    description: 'Flared roman inscriptional serif for distinguished institutions'
  },
  {
    name: 'Prata',
    label: 'Prata (Refined Elegant Didone)',
    category: 'Prestigious Heritage Serifs',
    description: 'Graceful didone serif with delicate teardrop terminals'
  },

  // 3. Calligraphy & Signature Scripts (Recipient Names & Official Signatures)
  {
    name: 'Pinyon Script',
    label: 'Pinyon Script (Royal Aristocratic Cursive)',
    category: 'Calligraphy & Signatures',
    description: 'Flawless high-society romantic cursive script, the top choice for recipient names'
  },
  {
    name: 'Great Vibes',
    label: 'Great Vibes (Signature Flourish Script)',
    category: 'Calligraphy & Signatures',
    description: 'Flowing cursive script with ascending and descending loops'
  },
  {
    name: 'Alex Brush',
    label: 'Alex Brush (Fluid Master Calligraphy)',
    category: 'Calligraphy & Signatures',
    description: 'Clean brush script calligraphy with high legibility'
  },
  {
    name: 'Allura',
    label: 'Allura (Graceful Flowing Signature)',
    category: 'Calligraphy & Signatures',
    description: 'Delicate stylized cursive for signatories and executive names'
  },
  {
    name: 'Dancing Script',
    label: 'Dancing Script (Vibrant Expressive Script)',
    category: 'Calligraphy & Signatures',
    description: 'Lively, friendly cursive script with casual charm'
  },
  {
    name: 'Parisienne',
    label: 'Parisienne (Classic French Vintage Script)',
    category: 'Calligraphy & Signatures',
    description: 'Spirited French boutique calligraphy with charming bounce'
  },
  {
    name: 'Italianno',
    label: 'Italianno (Formal Italian Calligraphy)',
    category: 'Calligraphy & Signatures',
    description: 'Tight, formal calligraphy inspired by Italian chancery cursive'
  },
  {
    name: 'Sacramento',
    label: 'Sacramento (Delicate Monoline Cursive)',
    category: 'Calligraphy & Signatures',
    description: 'Slender semi-connected monoline script'
  },

  // 4. Modern Corporate & Clean Sans
  {
    name: 'Plus Jakarta Sans',
    label: 'Plus Jakarta Sans (Modern Geometric Clean)',
    category: 'Modern Corporate Sans',
    description: 'Crisp contemporary sans-serif for clean corporate certificates'
  },
  {
    name: 'Montserrat',
    label: 'Montserrat (Prestigious Corporate Sans)',
    category: 'Modern Corporate Sans',
    description: 'Geometric authority sans for tech summits and global corporate awards'
  },
  {
    name: 'Inter',
    label: 'Inter (Neutral Professional Sans)',
    category: 'Modern Corporate Sans',
    description: 'Highly legible clean Swiss-style sans'
  },
  {
    name: 'Outfit',
    label: 'Outfit (Contemporary Sleek Sans)',
    category: 'Modern Corporate Sans',
    description: 'Modern geometric sans tailored for startup and tech academy credentials'
  },
  {
    name: 'Oswald',
    label: 'Oswald (Impactful Bold Header Sans)',
    category: 'Modern Corporate Sans',
    description: 'Bold condensed gothic sans for strong structural certificate headers'
  },

  // 5. Monospace & Credentials
  {
    name: 'JetBrains Mono',
    label: 'JetBrains Mono (Cryptographic Credential ID)',
    category: 'Monospace & Credentials',
    description: 'Precision developer monospace ideal for certificate serial IDs and hash codes'
  }
];

export const GOOGLE_FONTS_URL = 
  'https://fonts.googleapis.com/css2?' +
  'family=Alex+Brush&' +
  'family=Allura&' +
  'family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&' +
  'family=Cinzel+Decorative:wght@400;700;900&' +
  'family=Cinzel:wght@400..900&' +
  'family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&' +
  'family=Dancing+Script:wght@400..700&' +
  'family=EB+Garamond:ital,wght@0,400..800;1,400..800&' +
  'family=Great+Vibes&' +
  'family=Inter:wght@300..800&' +
  'family=Italianno&' +
  'family=JetBrains+Mono:wght@400..700&' +
  'family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&' +
  'family=Marcellus&' +
  'family=MedievalSharp&' +
  'family=Montserrat:ital,wght@0,400..800;1,400..800&' +
  'family=Oswald:wght@400..700&' +
  'family=Outfit:wght@400..700&' +
  'family=Parisienne&' +
  'family=Pinyon+Script&' +
  'family=Pirata+One&' +
  'family=Playfair+Display:ital,wght@0,400..900;1,400..900&' +
  'family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&' +
  'family=Prata&' +
  'family=Sacramento&' +
  'family=UnifrakturMaguntia&' +
  'display=swap';
