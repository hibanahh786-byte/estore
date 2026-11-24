import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, AlertCircle, ShoppingBag } from 'lucide-react';

export const ProductCard = ({ product, onQuickBuy, isBuying = false }) => {
  const isOutOfStock = product.stock_quantity <= 0;

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
      : 'http://localhost:8000';
    return `${base}${url}`;
  };

  const imageUrl = getImageUrl(product.image);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-[#2362f6] hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Preview */}
      <Link to={`/products/${product.id}`} className="relative block aspect-square bg-[#0f0f14] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#12121e] text-slate-400 p-4 text-center">
            <Zap className="w-12 h-12 text-[#2362f6] mb-2" />
            <span className="text-xs font-bold text-slate-300">Voltcase Accessory</span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0c0c0f]/80 backdrop-blur-md text-slate-200 border border-white/10 shadow-sm">
            {product.category_name || product.category_details?.name || 'Tech'}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Sold Out
            </span>
          ) : product.stock_quantity <= 5 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f97316] text-white shadow-sm">
              Only {product.stock_quantity} Left
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2362f6] text-white shadow-sm">
              In Stock
            </span>
          )}
        </div>
      </Link>

      {/* Info Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link
            to={`/products/${product.id}`}
            className="text-base font-bold text-slate-900 hover:text-[#2362f6] transition line-clamp-1 mb-1 block"
            title={product.name}
          >
            {product.name}
          </Link>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>Availability:</span>
            <span className={`font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-slate-700'}`}>
              {product.stock_quantity} units ready
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Price</span>
            <span className="text-xl font-black text-slate-900">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/products/${product.id}`}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Info
            </Link>

            <button
              onClick={() => onQuickBuy && onQuickBuy(product)}
              disabled={isOutOfStock || isBuying}
              className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 shadow-sm ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-[#2362f6] hover:bg-blue-600 active:bg-blue-700 text-white shadow-blue-600/20'
              } ${isBuying ? 'opacity-70' : ''}`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              {isBuying ? '...' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
