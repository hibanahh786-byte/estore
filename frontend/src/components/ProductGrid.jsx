import React from 'react';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';

export const ProductGrid = ({
  products = [],
  loading = false,
  onQuickBuy,
  buyingProductId,
  emptyMessage = "No products found matching your criteria."
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="pt-2 flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center my-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Products Available</h3>
        <p className="text-sm text-slate-500 max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickBuy={onQuickBuy}
          isBuying={buyingProductId === product.id}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
