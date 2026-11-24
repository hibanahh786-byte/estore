import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { orderService } from '../../api/orderService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProductGrid from '../../components/ProductGrid';
import CategoryFilter from '../../components/CategoryFilter';
import SearchBar from '../../components/SearchBar';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  // Filter States
  const selectedCategory = searchParams.get('category')
    ? parseInt(searchParams.get('category'))
    : null;
  const searchQuery = searchParams.get('search') || '';
  const sortOption = searchParams.get('ordering') || '-created_at';

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products based on URL query params
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (sortOption) params.ordering = sortOption;

      const data = await productService.getAllProducts(params);
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      addToast('Error loading products.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortOption, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Category selection
  const handleSelectCategory = (catId) => {
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
      newParams.set('category', catId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Handle Search input
  const handleSearchChange = (query) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  // Handle Sort
  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('ordering', e.target.value);
    setSearchParams(newParams);
  };

  // Direct Buy Now
  const handleQuickBuy = async (product) => {
    if (!isAuthenticated) {
      addToast('Please sign in to place an order.', 'info');
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }

    setBuyingId(product.id);
    try {
      const res = await orderService.placeOrder([{ product_id: product.id, quantity: 1 }]);
      addToast(`Order #${res.order?.id} placed successfully!`, 'success');
      // Refresh products to update stock quantities
      fetchProducts();
      navigate('/my-orders');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Could not place order. Please try again.';
      addToast(message, 'error');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our full catalog with real-time inventory validation.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            placeholder="Search by name..."
          />

          {/* Sort Selector */}
          <div className="relative flex-shrink-0">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition cursor-pointer shadow-sm"
            >
              <option value="-created_at">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Product Results */}
      <div className="pt-2">
        <ProductGrid
          products={products}
          loading={loading}
          onQuickBuy={handleQuickBuy}
          buyingProductId={buyingId}
          emptyMessage="No products match your filter or search query. Try choosing another category or clearing your search."
        />
      </div>
    </div>
  );
};

export default Products;
