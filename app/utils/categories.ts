import { db } from './firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';

const CATEGORIES_COLLECTION = 'categories';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const defaultCategories: Category[] = [
  // Asosiy kategoriyalar
  {
    id: 'amateur',
    name: 'Amateur',
    slug: 'amateur',
    description: 'Amateur videos'
  },
  {
    id: 'asian',
    name: 'Asian',
    slug: 'asian',
    description: 'Asian videos'
  },
  {
    id: 'blonde',
    name: 'Blonde',
    slug: 'blonde',
    description: 'Blonde videos'
  },
  {
    id: 'brunette',
    name: 'Brunette',
    slug: 'brunette',
    description: 'Brunette videos'
  },
  {
    id: 'ebony',
    name: 'Ebony',
    slug: 'ebony',
    description: 'Ebony videos'
  },
  {
    id: 'latina',
    name: 'Latina',
    slug: 'latina',
    description: 'Latina videos'
  },
  {
    id: 'milf',
    name: 'MILF',
    slug: 'milf',
    description: 'MILF videos'
  },
  {
    id: 'redhead',
    name: 'Redhead',
    slug: 'redhead',
    description: 'Redhead videos'
  },
  {
    id: 'russian',
    name: 'Russian',
    slug: 'russian',
    description: 'Russian videos'
  },
  {
    id: 'teen',
    name: 'Teen',
    slug: 'teen',
    description: 'Teen videos'
  },

  // Xususiyatlar
  {
    id: 'big-ass',
    name: 'Big Ass',
    slug: 'big-ass',
    description: 'Big ass videos'
  },
  {
    id: 'big-tits',
    name: 'Big Tits',
    slug: 'big-tits',
    description: 'Big tits videos'
  },
  {
    id: 'real',
    name: 'Real',
    slug: 'real',
    description: 'Real videos'
  },
  {
    id: 'verified',
    name: 'Verified',
    slug: 'verified',
    description: 'Verified videos'
  },

  // Harakatlar
  {
    id: 'anal',
    name: 'Anal',
    slug: 'anal',
    description: 'Anal videos'
  },
  {
    id: 'blowjob',
    name: 'Blowjob',
    slug: 'blowjob',
    description: 'Blowjob videos'
  },
  {
    id: 'creampie',
    name: 'Creampie',
    slug: 'creampie',
    description: 'Creampie videos'
  },
  {
    id: 'cumshot',
    name: 'Cumshot',
    slug: 'cumshot',
    description: 'Cumshot videos'
  },
  {
    id: 'deepthroat',
    name: 'DeepThroat',
    slug: 'deepthroat',
    description: 'DeepThroat videos'
  },
  {
    id: 'doggystyle',
    name: 'Doggystyle',
    slug: 'doggystyle',
    description: 'Doggystyle videos'
  },
  {
    id: 'facial',
    name: 'Facial',
    slug: 'facial',
    description: 'Facial videos'
  },
  {
    id: 'hardcore',
    name: 'Hardcore',
    slug: 'hardcore',
    description: 'Hardcore videos'
  },
  {
    id: 'interracial',
    name: 'Interracial',
    slug: 'interracial',
    description: 'Interracial videos'
  },
  {
    id: 'lesbian',
    name: 'Lesbian',
    slug: 'lesbian',
    description: 'Lesbian videos'
  },
  {
    id: 'masturbation',
    name: 'Masturbation',
    slug: 'masturbation',
    description: 'Masturbation videos'
  },
  {
    id: 'orgasm',
    name: 'Orgasm',
    slug: 'orgasm',
    description: 'Orgasm videos'
  },
  {
    id: 'pov',
    name: 'POV',
    slug: 'pov',
    description: 'POV videos'
  },
  {
    id: 'public',
    name: 'Public',
    slug: 'public',
    description: 'Public videos'
  },
  {
    id: 'solo',
    name: 'Solo',
    slug: 'solo',
    description: 'Solo videos'
  },
  {
    id: 'squirt',
    name: 'Squirt',
    slug: 'squirt',
    description: 'Squirt videos'
  },
  {
    id: 'threesome',
    name: 'Threesome',
    slug: 'threesome',
    description: 'Threesome videos'
  },
  {
    id: 'toys',
    name: 'Toys',
    slug: 'toys',
    description: 'Toys videos'
  },

  // Pornstarlar
  {
    id: 'abella-danger',
    name: 'Abella Danger',
    slug: 'abella-danger',
    description: 'Abella Danger videos'
  },
  {
    id: 'adriana-chechik',
    name: 'Adriana Chechik',
    slug: 'adriana-chechik',
    description: 'Adriana Chechik videos'
  },
  {
    id: 'angela-white',
    name: 'Angela White',
    slug: 'angela-white',
    description: 'Angela White videos'
  },
  {
    id: 'asa-akira',
    name: 'Asa Akira',
    slug: 'asa-akira',
    description: 'Asa Akira videos'
  },
  {
    id: 'brandi-love',
    name: 'Brandi Love',
    slug: 'brandi-love',
    description: 'Brandi Love videos'
  },
  {
    id: 'dani-daniels',
    name: 'Dani Daniels',
    slug: 'dani-daniels',
    description: 'Dani Daniels videos'
  },
  {
    id: 'eva-elfie',
    name: 'Eva Elfie',
    slug: 'eva-elfie',
    description: 'Eva Elfie videos'
  },
  {
    id: 'gabbie-carter',
    name: 'Gabbie Carter',
    slug: 'gabbie-carter',
    description: 'Gabbie Carter videos'
  },
  {
    id: 'jia-lissa',
    name: 'Jia Lissa',
    slug: 'jia-lissa',
    description: 'Jia Lissa videos'
  },
  {
    id: 'johnny-sins',
    name: 'Johnny Sins',
    slug: 'johnny-sins',
    description: 'Johnny Sins videos'
  },
  {
    id: 'lana-rhoades',
    name: 'Lana Rhoades',
    slug: 'lana-rhoades',
    description: 'Lana Rhoades videos'
  },
  {
    id: 'lisa-ann',
    name: 'Lisa Ann',
    slug: 'lisa-ann',
    description: 'Lisa Ann videos'
  },
  {
    id: 'mia-khalifa',
    name: 'Mia Khalifa',
    slug: 'mia-khalifa',
    description: 'Mia Khalifa videos'
  },
  {
    id: 'mia-malkova',
    name: 'Mia Malkova',
    slug: 'mia-malkova',
    description: 'Mia Malkova videos'
  },
  {
    id: 'nicole-aniston',
    name: 'Nicole Aniston',
    slug: 'nicole-aniston',
    description: 'Nicole Aniston videos'
  },
  {
    id: 'riley-reid',
    name: 'Riley Reid',
    slug: 'riley-reid',
    description: 'Riley Reid videos'
  },
  {
    id: 'sasha-grey',
    name: 'Sasha Grey',
    slug: 'sasha-grey',
    description: 'Sasha Grey videos'
  },
  {
    id: 'valentina-nappi',
    name: 'Valentina Nappi',
    slug: 'valentina-nappi',
    description: 'Valentina Nappi videos'
  }
];

// Kategoriyalarni guruhlash
export const categoryGroups = {
  main: defaultCategories.slice(0, 10),
  features: defaultCategories.slice(10, 14),
  actions: defaultCategories.slice(14, 32),
  pornstars: defaultCategories.slice(32)
};

export function generateCategoryId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export const addCategory = async (name: string): Promise<Category> => {
  const slug = generateCategoryId(name);
  const category = {
    id: slug,
    name,
    slug,
    description: `${name} videos`
  };
  
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), category);
  return { ...category, id: docRef.id };
};

export const getCategories = async (): Promise<Category[]> => {
  const q = query(collection(db, CATEGORIES_COLLECTION));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Category));
}; 