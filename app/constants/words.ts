// Word list with categories and metadata

export type Category = 'nafn' | 'sagn' | 'lys' | 'orne';

interface Word {
  id: string;
  word: string;
  category: Category;
}

const CATEGORIES = [
  {
    id: 'nafn',
    label: 'Nafnorð',
    emoji: '🏠',
  },
  {
    id: 'sagn',
    label: 'Sagnorð',
    emoji: '🏃',
  },
  {
    id: 'lys',
    label: 'Lýsingaorð',
    emoji: '🎨',
  },
  {
    id: 'orne',
    label: 'Örnefni',
    emoji: '🗺️',
  },
] as const;

const WORDS: Word[] = [
  {
    id: 'eldfjall',
    word: 'eldfjall',
    category: 'nafn',
  },
  {
    id: 'dansa',
    word: 'dansa',
    category: 'sagn',
  },
  {
    id: 'elding',
    word: 'elding',
    category: 'nafn',
  },
  {
    id: 'althingi',
    word: 'alþingi',
    category: 'nafn',
  },
  {
    id: 'radherra',
    word: 'ráðherra',
    category: 'nafn',
  },
  {
    id: 'thingvallavatn',
    word: 'Þingvallavatn',
    category: 'orne',
  },
];

export { type Word, WORDS, CATEGORIES };
