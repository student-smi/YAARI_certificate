export interface CertificateSignatory {
  name: string;
  role: string;
  organization?: string;
  signatureSvgType?: 'flourish' | 'classic' | 'modern' | 'diplomatic';
}

export interface SampleCertificate {
  id: number;
  title: string;
  category: string;
  orientation: 'landscape' | 'portrait';
  instituteName: string;
  instituteSubtitle: string;
  instituteMonogram: string;
  achievementTitle: string;
  statement: string;
  recipientName: string;
  issueDate: string;
  certNumber: string;
  courseDuration?: string;
  signatories: CertificateSignatory[];
  theme: {
    bgClass: string;
    bgStyle?: React.CSSProperties;
    primaryText: string;
    secondaryText: string;
    accentColor: string;
    borderColor: string;
    borderStyle: string;
    fontTitle: string;
    fontBody: string;
    fontName: string;
    sealType: 'gold-classic' | 'rosette-burgundy' | 'academic-crest' | 'sports-medal' | 'teal-emblem' | 'silver-corporate' | 'cyber-terminal' | 'emerald-wreath' | 'purple-polygon' | 'gold-embossed';
  };
}

export const SAMPLE_CERTIFICATES: SampleCertificate[] = [
  {
    id: 1,
    title: 'Certificate of Completion',
    category: 'Executive Education',
    orientation: 'landscape',
    instituteName: 'Nexa Institute of Digital Arts',
    instituteSubtitle: 'Center for Professional Growth & Applied Sciences',
    instituteMonogram: 'NDA',
    achievementTitle: 'Digital Marketing Masterclass',
    statement: 'has fulfilled all academic requirements, practical campaigns, and capstone evaluations with superior distinction in the',
    recipientName: 'Riya Sharma',
    issueDate: 'October 12, 2026',
    certNumber: 'CC-2026-DMM-0814',
    signatories: [
      {
        name: 'Dr. Marcus Vance',
        role: 'Director of Executive Education',
        organization: 'Nexa Institute of Digital Arts',
        signatureSvgType: 'classic'
      },
      {
        name: 'Elena Rossi',
        role: 'Dean of Curriculum',
        organization: 'Nexa Institute of Digital Arts',
        signatureSvgType: 'flourish'
      }
    ],
    theme: {
      bgClass: 'bg-[#FCFBF7]',
      primaryText: '#0A192F',
      secondaryText: '#475569',
      accentColor: '#B45309',
      borderColor: '#B45309',
      borderStyle: 'double-gold',
      fontTitle: 'font-[\'Cinzel\',serif]',
      fontBody: 'font-serif',
      fontName: 'font-serif',
      sealType: 'gold-classic'
    }
  },
  {
    id: 2,
    title: 'Certificate of Performance',
    category: 'Academic Honor',
    orientation: 'landscape',
    instituteName: 'St. Jude Academy of Higher Learning',
    instituteSubtitle: 'Faculty of Arts & Sciences • Established 1974',
    instituteMonogram: 'SJA',
    achievementTitle: 'Outstanding Academic Performance',
    statement: 'in recognition of sustained scholastic excellence, exemplary intellectual leadership, and highest honors achieved in',
    recipientName: 'Aarav Patel',
    issueDate: 'October 08, 2026',
    certNumber: 'CC-2026-OAP-4029',
    signatories: [
      {
        name: 'Prof. Jonathan Sterling',
        role: 'Dean of Academic Affairs',
        organization: 'St. Jude Academy',
        signatureSvgType: 'classic'
      },
      {
        name: 'Marianne Davies',
        role: 'Chair of Honors Committee',
        organization: 'St. Jude Academy',
        signatureSvgType: 'diplomatic'
      }
    ],
    theme: {
      bgClass: 'bg-white',
      primaryText: '#4C0519',
      secondaryText: '#701A75',
      accentColor: '#9F1239',
      borderColor: '#881337',
      borderStyle: 'asymmetric-burgundy',
      fontTitle: 'font-[\'Playfair_Display\',serif]',
      fontBody: 'font-sans',
      fontName: 'font-serif',
      sealType: 'rosette-burgundy'
    }
  },
  {
    id: 3,
    title: 'Diploma Certificate',
    category: 'Vocational Diploma',
    orientation: 'portrait',
    instituteName: "L'Étoile Academy of Aesthetic Arts",
    instituteSubtitle: 'International Conservatory of High Fashion & Cosmetology',
    instituteMonogram: 'LEA',
    achievementTitle: 'Diploma in Professional Makeup Artistry',
    statement: 'having successfully satisfied all theoretical criteria and clinical studio practicum with superlative merit, is hereby awarded this Diploma in',
    recipientName: 'Meera Shah',
    issueDate: 'September 28, 2026',
    certNumber: 'CC-2026-DIP-1932',
    signatories: [
      {
        name: 'Colette Laurent',
        role: 'Master Educator & Founder',
        organization: "L'Étoile Academy",
        signatureSvgType: 'flourish'
      },
      {
        name: 'Jean-Luc Moreau',
        role: 'Board Chancellor',
        organization: 'Federation of Aesthetic Arts',
        signatureSvgType: 'diplomatic'
      }
    ],
    theme: {
      bgClass: 'bg-[#FAF6EE]',
      primaryText: '#18181B',
      secondaryText: '#52525B',
      accentColor: '#854D0E',
      borderColor: '#A16207',
      borderStyle: 'portrait-parchment',
      fontTitle: 'font-[\'Cinzel\',serif]',
      fontBody: 'font-serif',
      fontName: 'font-serif',
      sealType: 'academic-crest'
    }
  },
  {
    id: 4,
    title: 'Certificate of Sports Achievement',
    category: 'Athletics & Fitness',
    orientation: 'landscape',
    instituteName: 'Apex Athletic Academy & Sports Federation',
    instituteSubtitle: 'Intercollegiate Championship Division',
    instituteMonogram: 'AAA',
    achievementTitle: 'First Place in an Interacademy Athletics Event',
    statement: 'for outstanding physical discipline, peerless competitive spirit, and champion performance in the 800m Sprint Category at the',
    recipientName: 'Kunal Desai',
    issueDate: 'October 04, 2026',
    certNumber: 'CC-2026-ATH-7721',
    signatories: [
      {
        name: 'Coach Vikram Singhania',
        role: 'Head of Track & Field',
        organization: 'Apex Athletic Academy',
        signatureSvgType: 'modern'
      },
      {
        name: 'Tanya Brooks',
        role: 'Tournament Director',
        organization: 'National Collegiate League',
        signatureSvgType: 'flourish'
      }
    ],
    theme: {
      bgClass: 'bg-[#FCFCFD]',
      primaryText: '#1E3A8A',
      secondaryText: '#475569',
      accentColor: '#EA580C',
      borderColor: '#1D4ED8',
      borderStyle: 'sports-chevrons',
      fontTitle: 'font-[\'Montserrat\',sans-serif]',
      fontBody: 'font-sans',
      fontName: 'font-serif',
      sealType: 'sports-medal'
    }
  },
  {
    id: 5,
    title: 'Certificate of Workshop Participation',
    category: 'Interactive Workshop',
    orientation: 'landscape',
    instituteName: 'Cognition Lab Innovations & AI Academy',
    instituteSubtitle: 'Center for Applied Machine Intelligence & Automation',
    instituteMonogram: 'CLI',
    achievementTitle: 'AI Tools for Business Workshop',
    statement: 'for active participation, collaborative laboratory exercises, and masterclass execution of neural workflows in the intensive',
    recipientName: 'Ananya Iyer',
    issueDate: 'October 10, 2026',
    certNumber: 'CC-2026-WSP-3390',
    signatories: [
      {
        name: 'Dr. Sanjay Malhotra',
        role: 'Lead AI Strategist & Fellow',
        organization: 'Cognition Lab Innovations',
        signatureSvgType: 'modern'
      }
    ],
    theme: {
      bgClass: 'bg-[#F9FCFA]',
      primaryText: '#044E39',
      secondaryText: '#334155',
      accentColor: '#00A884',
      borderColor: '#0D9488',
      borderStyle: 'modern-teal',
      fontTitle: 'font-[\'Plus_Jakarta_Sans\',sans-serif]',
      fontBody: 'font-sans',
      fontName: 'font-serif',
      sealType: 'teal-emblem'
    }
  },
  {
    id: 6,
    title: 'Certificate of Training Completion',
    category: 'Corporate Enterprise',
    orientation: 'landscape',
    instituteName: 'Sovereign Executive Leadership Institute',
    instituteSubtitle: 'Global Corporate Development & Board Advisory',
    instituteMonogram: 'SELI',
    achievementTitle: 'Leadership and Communication Training',
    statement: 'has comprehensively demonstrated leadership agility, strategic stakeholder influence, and executive management excellence in',
    recipientName: 'Siddharth Roy',
    issueDate: 'October 01, 2026',
    certNumber: 'CC-2026-LCT-5518',
    signatories: [
      {
        name: 'Victoria Vance',
        role: 'Chief Learning Officer',
        organization: 'Sovereign Institute',
        signatureSvgType: 'diplomatic'
      },
      {
        name: 'David K. Chen',
        role: 'Managing Director',
        organization: 'Sovereign Institute',
        signatureSvgType: 'classic'
      }
    ],
    theme: {
      bgClass: 'bg-[#0B192C]',
      primaryText: '#F8FAFC',
      secondaryText: '#CBD5E1',
      accentColor: '#38BDF8',
      borderColor: '#94A3B8',
      borderStyle: 'corporate-silver',
      fontTitle: 'font-[\'Cinzel\',serif]',
      fontBody: 'font-sans',
      fontName: 'font-serif',
      sealType: 'silver-corporate'
    }
  },
  {
    id: 7,
    title: 'Certificate of Bootcamp Completion',
    category: 'Software Engineering',
    orientation: 'landscape',
    instituteName: 'ByteForge Engineering Academy',
    instituteSubtitle: 'Full Stack Systems & Distributed Architecture Guild',
    instituteMonogram: 'BFE',
    achievementTitle: 'Full Stack Development Bootcamp',
    statement: 'for deploying 4 production microservices, passing 32 algorithmic code reviews, and completing 480 hours of rigorous software engineering in the',
    recipientName: 'Rohan Kapoor',
    issueDate: 'October 11, 2026',
    certNumber: 'CC-2026-FSD-9012',
    signatories: [
      {
        name: 'Alex Rivera',
        role: 'Head of Engineering & Fellow',
        organization: 'ByteForge Engineering Academy',
        signatureSvgType: 'modern'
      }
    ],
    theme: {
      bgClass: 'bg-[#F8FAFC]',
      primaryText: '#1E1B4B',
      secondaryText: '#4338CA',
      accentColor: '#06B6D4',
      borderColor: '#4338CA',
      borderStyle: 'tech-grid',
      fontTitle: 'font-[\'Montserrat\',sans-serif]',
      fontBody: 'font-mono',
      fontName: 'font-serif',
      sealType: 'cyber-terminal'
    }
  },
  {
    id: 8,
    title: 'Certificate of Course Completion',
    category: 'Vocational Artistry',
    orientation: 'landscape',
    instituteName: 'Maison Haute Coiffure Academy',
    instituteSubtitle: 'Conservatory of Advanced Esthetics & Salon Management',
    instituteMonogram: 'MHC',
    achievementTitle: 'Advanced Hair Styling Course',
    courseDuration: 'Duration: 240 Contact Hours & Studio Practicum',
    statement: 'having successfully demonstrated professional mastery in colorimetry, avant-garde sculpting, and salon management in the intensive',
    recipientName: 'Priya Nair',
    issueDate: 'September 22, 2026',
    certNumber: 'CC-2026-AHS-6124',
    signatories: [
      {
        name: 'Jacqueline Dubois',
        role: 'Artistic Director',
        organization: 'Maison Haute Coiffure',
        signatureSvgType: 'flourish'
      },
      {
        name: 'Henri Beaumont',
        role: 'Dean of Vocational Studies',
        organization: 'Maison Haute Coiffure',
        signatureSvgType: 'classic'
      }
    ],
    theme: {
      bgClass: 'bg-[#FAF9F5]',
      primaryText: '#064E3B',
      secondaryText: '#047857',
      accentColor: '#D97706',
      borderColor: '#047857',
      borderStyle: 'emerald-botanical',
      fontTitle: 'font-[\'Cormorant_Garamond\',serif]',
      fontBody: 'font-serif',
      fontName: 'font-serif',
      sealType: 'emerald-wreath'
    }
  },
  {
    id: 9,
    title: 'Certificate of Program Completion',
    category: 'Venture & Incubation',
    orientation: 'landscape',
    instituteName: 'Vanguard Ventures & Innovation Guild',
    instituteSubtitle: 'Global Accelerator & Founder Fellowship',
    instituteMonogram: 'VVI',
    achievementTitle: 'Entrepreneurship Development Program',
    statement: 'for successfully building product-market validation, financial modeling, and pitching before venture syndicate partners in the',
    recipientName: 'Arjun Mehra',
    issueDate: 'October 05, 2026',
    certNumber: 'CC-2026-EDP-8451',
    signatories: [
      {
        name: 'Natasha Romanoff-Gupta',
        role: 'Program Director',
        organization: 'Vanguard Innovation Guild',
        signatureSvgType: 'diplomatic'
      },
      {
        name: 'Kabir Saxena',
        role: 'Principal Venture Partner',
        organization: 'Vanguard Ventures',
        signatureSvgType: 'modern'
      }
    ],
    theme: {
      bgClass: 'bg-white',
      primaryText: '#3B0764',
      secondaryText: '#6B21A8',
      accentColor: '#9333EA',
      borderColor: '#581C87',
      borderStyle: 'purple-geometric',
      fontTitle: 'font-[\'Cinzel\',serif]',
      fontBody: 'font-sans',
      fontName: 'font-serif',
      sealType: 'purple-polygon'
    }
  },
  {
    id: 10,
    title: 'Certificate of Excellence',
    category: 'Distinguished Award',
    orientation: 'landscape',
    instituteName: 'Lumina Atelier of Fine & Applied Arts',
    instituteSubtitle: 'Society for Creative Vanguard & Visual Excellence',
    instituteMonogram: 'LAA',
    achievementTitle: 'Excellence in Creative Design',
    statement: 'conferred in solemn recognition of exceptional creative vision, breakthrough craftsmanship, and best-in-class capstone work in the field of',
    recipientName: 'Tanya Sen',
    issueDate: 'October 09, 2026',
    certNumber: 'CC-2026-ECD-1102',
    signatories: [
      {
        name: 'Julian Hawthorne',
        role: 'President of the Guild & Chancellor',
        organization: 'Lumina Atelier of Fine Arts',
        signatureSvgType: 'flourish'
      }
    ],
    theme: {
      bgClass: 'bg-[#FCFAF2]',
      primaryText: '#18181B',
      secondaryText: '#52525B',
      accentColor: '#CA8A04',
      borderColor: '#A16207',
      borderStyle: 'ornate-gold-charcoal',
      fontTitle: 'font-[\'Cinzel\',serif]',
      fontBody: 'font-serif',
      fontName: 'font-serif',
      sealType: 'gold-embossed'
    }
  }
];
