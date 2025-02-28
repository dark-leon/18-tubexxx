import { db } from './firebase';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';

const CATEGORIES_COLLECTION = 'categories';

export const categories = [
  'Asian',
  'Doggystyle',
  'DeepThroat',
  'Real',
  'Big Ass',
  'Amateur',
  'Hardcore',
  'POV',
  'Blowjob',
  'Threesome'
];

export interface Category {
  id: string;
  name: string;
}

export function generateCategoryId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export const categoryList: Category[] = categories.map(name => ({
  id: generateCategoryId(name),
  name
}));

export const addCategory = async (name: string): Promise<Category> => {
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), { name });
  return { id: docRef.id, name };
};

export const getCategories = async (): Promise<Category[]> => {
  const q = query(collection(db, CATEGORIES_COLLECTION));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name
  }));
}; 