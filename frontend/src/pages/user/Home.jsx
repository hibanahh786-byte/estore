import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { orderService } from '../../api/orderService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProductGrid from '../../components/ProductGrid';
import { 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Layers,
  BatteryCharging,
  Cpu,
  Smartphone
} from 'lucide-react';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          categoryService.getAllCategories(),
          productService.getAllProducts({ ordering: '-created_at' }),
        ]);
        setCategories(cats || []);
        setFeaturedProducts((prods || []).slice(0, 8));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickBuy = async (product) => {
    if (!isAuthenticated) {
      addToast('Please sign in to place an order.', 'info');
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }

    setBuyingId(product.id);
    try {
      const res = await orderService.placeOrder([{ product_id: product.id, quantity: 1 }]);
      addToast(`Order #${res.order?.id || ''} placed successfully!`, 'success');
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
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0c0c0f] text-white p-8 sm:p-14 lg:p-20 border border-white/10 shadow-2xl">
        {/* Subtle background tech glow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 rounded-full bg-[#2362f6]/20 blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-7">
          {/* Tag: • ENGINEERED FOR YOUR EVERYDAY */}
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
            <span>Engineered For Your Everyday</span>
          </div>

          {/* Massive Heading: Better tech. Every day. */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            <span className="block text-white">Better tech.</span>
            <span className="block text-[#8da9fc]">Every day.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
            Protection that makes a statement. Power that keeps up. Meet the essentials your devices deserve.
          </p>

          {/* CTA Button: SHOP THE ESSENTIALS -> */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#2362f6] hover:bg-blue-600 active:bg-blue-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Shop The Essentials</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl border border-white/10 transition"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#2362f6]" />
              Shop By Category
            </h2>
            <p className="text-sm text-slate-500 mt-1">Curated gear tailored for your ecosystem</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#2362f6] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#2362f6] hover:shadow-lg transition group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2362f6] flex items-center justify-center font-black text-lg mb-3 group-hover:bg-[#2362f6] group-hover:text-white transition">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-[#2362f6] transition">
                  {cat.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {cat.products_count !== undefined ? `${cat.products_count} items` : 'Explore'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#2362f6]" />
              Everyday Essentials
            </h2>
            <p className="text-sm text-slate-500 mt-1">Tested for durability and maximum charging efficiency</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#2362f6] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid
          products={featuredProducts}
          loading={loading}
          onQuickBuy={handleQuickBuy}
          buyingProductId={buyingId}
        />
      </section>

      {/* Tech Specifications & Trust Matrix */}
      <section className="rounded-3xl bg-[#0c0c0f] text-white p-8 sm:p-12 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#8da9fc] flex items-center justify-center">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">GaN 3.0 Ultra-Fast Power</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              High density gallium-nitride architecture delivers full-speed charging with 40% cooler operation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#2362f6] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Military-Grade Drop Tested</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Reinforced shock corners and raised bezel edges shield your screens and lenses from up to 12ft impacts.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#f97316] flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Strong Magnetic Alignment</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              36 N52 rare-earth magnets ensure an ultra-secure 1,500g hold with all MagSafe accessories.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
