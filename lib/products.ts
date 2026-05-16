export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  name: string;
  collection: string;
  collectionKey: 'everyday-gold' | 'bridal-gold' | 'lab-diamond' | 'silver';
  price: number;
  images: string[];
  description: string;
  specs: Spec[];
  sizes?: string[];
  related?: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: 'slim-rope-chain',
    name: 'Slim Rope Chain',
    collection: 'Everyday Gold',
    collectionKey: 'everyday-gold',
    price: 42000,
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      "A 1.2mm rope chain in 18kt gold — the chain you forget you're wearing. Layers with anything; clasps neatly behind the nape.",
    specs: [
      { label: 'Metal', value: '18kt Gold' },
      { label: 'Gross weight', value: '4.2 g' },
      { label: 'Length', value: '16" / 18" / 20"' },
      { label: 'Width', value: '1.2 mm' },
      { label: 'Hallmark', value: 'BIS 750' },
      { label: 'Clasp', value: 'Spring ring' }
    ],
    sizes: ['16"', '18"', '20"'],
    related: ['ila-stack-trio', 'soumya-pendant', 'ruh-studs']
  },
  {
    id: 'ila-stack-trio',
    name: 'Ila Stack Trio',
    collection: 'Everyday Gold',
    collectionKey: 'everyday-gold',
    price: 54800,
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'Three stackable bands: one plain, one hand-engraved with a meandering line, one with a single 0.05ct lab-grown diamond. Wear together or apart.',
    specs: [
      { label: 'Metal', value: '18kt Gold (set of three)' },
      { label: 'Gross weight', value: '6.8 g total' },
      { label: 'Stones', value: '1 × 0.05ct lab-grown diamond, VS' },
      { label: 'Band width', value: '1.6 mm each' },
      { label: 'Hallmark', value: 'BIS 750' },
      { label: 'Sizing', value: 'Available 6–18' }
    ],
    sizes: ['10', '12', '14', '16'],
    related: ['slim-rope-chain', 'soumya-pendant', 'ruh-studs']
  },
  {
    id: 'soumya-pendant',
    name: 'Soumya Pendant',
    collection: 'Everyday Gold',
    collectionKey: 'everyday-gold',
    price: 28400,
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'A delicate teardrop pendant set with a single 0.08ct lab-grown diamond. Suspended from a 16-inch 18kt chain. Layer it, or let it speak alone.',
    specs: [
      { label: 'Metal', value: '18kt Gold' },
      { label: 'Gross weight', value: '3.6 g (incl. chain)' },
      { label: 'Stone', value: '0.08ct lab-grown diamond, VS' },
      { label: 'Chain length', value: '16 inches' },
      { label: 'Hallmark', value: 'BIS 750' },
      { label: 'Clasp', value: 'Spring ring' }
    ],
    related: ['slim-rope-chain', 'ila-stack-trio', 'ruh-studs']
  },
  {
    id: 'mango-haar',
    name: 'Mango Haar',
    collection: 'Bridal Lightweight Gold',
    collectionKey: 'bridal-gold',
    price: 184000,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'A lightweight bridal haar drawn from the southern mango motif. Engineered hollow at the back, full at the front — heritage form, modern weight.',
    specs: [
      { label: 'Metal', value: '22kt Gold (916 hallmarked)' },
      { label: 'Gross weight', value: '18.4 g' },
      { label: 'Stones', value: 'Ruby and pearl accents' },
      { label: 'Length', value: '16 inches, adjustable' },
      { label: 'Hallmark', value: 'BIS 916' },
      { label: 'Closure', value: 'S-hook with safety chain' }
    ],
    related: ['saanjh-choker', 'peacock-jhumka', 'naina-drops']
  },
  {
    id: 'peacock-jhumka',
    name: 'Peacock Jhumka',
    collection: 'Bridal Lightweight Gold',
    collectionKey: 'bridal-gold',
    price: 68200,
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      '22kt gold jhumkas in a peacock plume silhouette, finished with seed-pearl drops. Light enough for the reception, weighty enough for the photographs.',
    specs: [
      { label: 'Metal', value: '22kt Gold' },
      { label: 'Gross weight', value: '9.2 g' },
      { label: 'Accents', value: 'Seed-pearl drops' },
      { label: 'Drop length', value: '52 mm' },
      { label: 'Hallmark', value: 'BIS 916' },
      { label: 'Closure', value: 'Screw-back' }
    ],
    related: ['mango-haar', 'saanjh-choker', 'naina-drops']
  },
  {
    id: 'saanjh-choker',
    name: 'Saanjh Choker',
    collection: 'Bridal Lightweight Gold',
    collectionKey: 'bridal-gold',
    price: 212000,
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'A statement bridal choker patterned with hand-engraved florals and emerald drops, set in lightweight 22kt gold. Made for the moment, kept for life.',
    specs: [
      { label: 'Metal', value: '22kt Gold' },
      { label: 'Gross weight', value: '24.2 g' },
      { label: 'Stones', value: 'Emerald, pearl accents' },
      { label: 'Adjustable length', value: '13.5"–15"' },
      { label: 'Hallmark', value: 'BIS 916' },
      { label: 'Certification', value: 'GIA certified emeralds' }
    ],
    related: ['mango-haar', 'peacock-jhumka', 'lumen-solitaire']
  },
  {
    id: 'lumen-solitaire',
    name: 'Lumen Solitaire',
    collection: 'Lab-Grown Diamonds',
    collectionKey: 'lab-diamond',
    price: 148500,
    images: [
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'A 0.50ct lab-grown round brilliant set in a four-prong platinum band. IGI graded F colour, VS1 clarity, excellent cut. Chemically identical to mined, ethically clearer.',
    specs: [
      { label: 'Metal', value: 'Platinum 950' },
      { label: 'Centre stone', value: '0.50ct lab-grown round brilliant' },
      { label: 'Colour / clarity', value: 'F / VS1' },
      { label: 'Cut', value: 'Excellent' },
      { label: 'Hallmark', value: 'Pt 950' },
      { label: 'Certification', value: 'IGI Lab-Grown Diamond Report' }
    ],
    sizes: ['10', '12', '14', '16', '18'],
    related: ['ruh-studs', 'naina-drops', 'soumya-pendant']
  },
  {
    id: 'ruh-studs',
    name: 'Ruh Studs',
    collection: 'Lab-Grown Diamonds',
    collectionKey: 'lab-diamond',
    price: 38500,
    images: [
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'A pair of 0.20ct lab-grown round brilliants in four-prong 18kt gold settings. The honest second-piercing earring — certified, sustainable, brilliant.',
    specs: [
      { label: 'Metal', value: '18kt Gold' },
      { label: 'Stones', value: '2 × 0.20ct lab-grown rounds' },
      { label: 'Colour / clarity', value: 'G / VS2' },
      { label: 'Setting', value: 'Four-prong' },
      { label: 'Hallmark', value: 'BIS 750' },
      { label: 'Certification', value: 'IGI Lab-Grown Report (each stone)' }
    ],
    related: ['lumen-solitaire', 'naina-drops', 'ila-stack-trio']
  },
  {
    id: 'naina-drops',
    name: 'Naina Drops',
    collection: 'Lab-Grown Diamonds',
    collectionKey: 'lab-diamond',
    price: 62800,
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'Slender drop earrings ending in 0.15ct pear-cut lab-grown diamonds. The pair that finishes every neckline — high, low, anywhere in between.',
    specs: [
      { label: 'Metal', value: '18kt Gold' },
      { label: 'Stones', value: '2 × 0.15ct lab-grown pears, G/VS' },
      { label: 'Drop length', value: '34 mm' },
      { label: 'Hallmark', value: 'BIS 750' },
      { label: 'Closure', value: 'Lever-back' },
      { label: 'Certification', value: 'IGI Lab-Grown Report' }
    ],
    related: ['ruh-studs', 'lumen-solitaire', 'soumya-pendant']
  },
  {
    id: 'aarya-cuff',
    name: 'Aarya Cuff',
    collection: '92.5 Silver',
    collectionKey: 'silver',
    price: 14400,
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'An architectural cuff in solid 92.5 sterling silver, hand-finished to a satin sheen. Wear alone or stacked over a watch.',
    specs: [
      { label: 'Metal', value: '92.5 Sterling Silver' },
      { label: 'Gross weight', value: '32.6 g' },
      { label: 'Finish', value: 'Hand-brushed satin' },
      { label: 'Cuff opening', value: 'Adjustable 56–62 mm' },
      { label: 'Hallmark', value: '92.5 stamped' },
      { label: 'Anti-tarnish', value: 'Rhodium-finished' }
    ],
    related: ['kavi-studs', 'veena-pendant', 'ila-stack-trio']
  },
  {
    id: 'kavi-studs',
    name: 'Kavi Studs',
    collection: '92.5 Silver',
    collectionKey: 'silver',
    price: 6800,
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'A pair of 92.5 silver studs with a single freshwater pearl. The morning earring — finished by the time the kettle whistles.',
    specs: [
      { label: 'Metal', value: '92.5 Sterling Silver' },
      { label: 'Stone', value: 'Freshwater pearl, 5 mm' },
      { label: 'Stud size', value: '6 mm cup' },
      { label: 'Hallmark', value: '92.5 stamped' },
      { label: 'Closure', value: 'Push-back with grip' },
      { label: 'Anti-tarnish', value: 'Rhodium-finished' }
    ],
    related: ['veena-pendant', 'aarya-cuff', 'ruh-studs']
  },
  {
    id: 'veena-pendant',
    name: 'Veena Pendant',
    collection: '92.5 Silver',
    collectionKey: 'silver',
    price: 9200,
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&q=80&auto=format&fit=crop'
    ],
    description:
      'A slim 92.5 silver disc engraved with a single line of a Tirukkural couplet. Comes on a 18-inch silver chain. Quiet, personal.',
    specs: [
      { label: 'Metal', value: '92.5 Sterling Silver' },
      { label: 'Gross weight', value: '4.4 g (incl. chain)' },
      { label: 'Disc diameter', value: '16 mm' },
      { label: 'Chain length', value: '18 inches' },
      { label: 'Hallmark', value: '92.5 stamped' },
      { label: 'Personalisation', value: 'Available — add at checkout' }
    ],
    related: ['aarya-cuff', 'kavi-studs', 'soumya-pendant']
  }
];

export const COLLECTION_LABELS: Record<string, string> = {
  all: 'All Pieces',
  'everyday-gold': 'Everyday Gold',
  'bridal-gold': 'Bridal Lightweight',
  'lab-diamond': 'Lab-Grown Diamonds',
  silver: '92.5 Silver'
};

export const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'everyday-gold', label: 'Everyday Gold' },
  { key: 'bridal-gold', label: 'Bridal Lightweight' },
  { key: 'lab-diamond', label: 'Lab-Grown Diamonds' },
  { key: 'silver', label: '92.5 Silver' }
];

export const HOME_SIGNATURE_IDS = [
  'mango-haar',
  'lumen-solitaire',
  'peacock-jhumka',
  'aarya-cuff',
  'ila-stack-trio',
  'naina-drops'
];

export const getProduct = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);

export const inr = (n: number): string => '₹' + n.toLocaleString('en-IN');
