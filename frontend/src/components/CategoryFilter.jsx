import React from 'react';
import { Layers } from 'lucide-react';

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
          selectedCategory === null
            ? 'bg-[#2362f6] text-white shadow-md shadow-blue-600/30'
            : 'bg-white text-slate-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        All Products
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            selectedCategory === cat.id
              ? 'bg-[#2362f6] text-white shadow-md shadow-blue-600/30'
              : 'bg-white text-slate-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {cat.name}
          {cat.products_count !== undefined && (
            <span
              className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === cat.id
                  ? 'bg-blue-800 text-white'
                  : 'bg-gray-100 text-slate-500'
              }`}
            >
              {cat.products_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
