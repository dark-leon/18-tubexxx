import { useState, useEffect } from 'react';
import { Category, addCategory, getCategories } from '../utils/categories';

interface CategorySelectProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export default function CategorySelect({ selectedCategories, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setIsLoading(false);
    } catch (err) {
      setError('Kategoriyalarni yuklashda xatolik yuz berdi');
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const addedCategory = await addCategory(newCategory.trim());
      setCategories([...categories, addedCategory]);
      setNewCategory('');
      setIsAddingNew(false);
      // Yangi kategoriyani avtomatik ravishda tanlangan kategoriyalarga qo'shamiz
      onChange([...selectedCategories, addedCategory.id]);
    } catch (err) {
      setError('Yangi kategoriya qo\'shishda xatolik yuz berdi');
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    const updatedCategories = isSelected
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onChange(updatedCategories);
  };

  if (isLoading) return <div className="text-gray-400">Yuklanmoqda...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <select
          className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          value=""
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="" disabled>Kategoriyani tanlang</option>
          {categories.map((category) => (
            <option 
              key={category.id} 
              value={category.id}
              disabled={selectedCategories.includes(category.id)}
            >
              {category.name}
            </option>
          ))}
        </select>

        {/* Tanlangan kategoriyalar */}
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((categoryId) => {
            const category = categories.find(c => c.id === categoryId);
            if (!category) return null;
            return (
              <div
                key={category.id}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-full text-sm"
              >
                <span>{category.name}</span>
                <button
                  onClick={() => handleCategoryChange(category.id)}
                  className="text-white hover:text-red-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yangi kategoriya qo'shish */}
      {isAddingNew ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Yangi kategoriya nomi..."
            className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
            className={`px-4 py-2 rounded-lg font-medium ${
              newCategory.trim()
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Qo'shish
          </button>
          <button
            onClick={() => {
              setIsAddingNew(false);
              setNewCategory('');
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
          >
            Bekor qilish
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingNew(true)}
          className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi kategoriya qo'shish
        </button>
      )}
    </div>
  );
} 