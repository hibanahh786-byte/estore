import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../api/productService';
import { orderService } from '../../api/orderService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { 
  ShoppingBag, 
  Minus, 
  Plus, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle2,
  Package
} from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product details. Product may have been deleted.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (delta) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock_quantity) {
      setQuantity(newQty);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to place your order.', 'info');
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    if (!product || product.stock_quantity <= 0) {
      addToast('Sorry, this product is out of stock.', 'error');
      return;
    }

    if (quantity > product.stock_quantity) {
      addToast(`Only ${product.stock_quantity} units available.`, 'error');
      return;
    }

    setOrdering(true);
    try {
      // Send ONLY product_id and quantity. Server calculates total amount authoritative!
      const payload = [
        {
          product_id: product.id,
          quantity: quantity,
        },
      ];

      const res = await orderService.placeOrder(payload);
      addToast(`Order #${res.order?.id} created successfully!`, 'success');

      // Update local product stock
      setProduct((prev) => ({
        ...prev,
        stock_quantity: prev.stock_quantity - quantity,
      }));

      navigate('/my-orders');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Could not complete purchase. Please try again.';
      addToast(message, 'error');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading product information..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorMessage message={error || 'Product not found.'} />
        <Link
          to="/products"
          className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

  // Resolve image URL
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
        {/* Left: Product Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <Package className="w-16 h-16 text-slate-300 mb-2" />
              <span className="text-sm font-medium">No Image Uploaded</span>
            </div>
          )}

          {/* Stock Tag on image */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-700 shadow-sm border border-gray-100">
              {product.category_name || product.category_details?.name || 'Item'}
            </span>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Out of stock
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In stock ({product.stock_quantity} available)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">USD</span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-gray-100">
              Premium quality product crafted for everyday reliability. All purchases include instantaneous inventory locking, verified atomic stock reduction, and safe server calculations.
            </p>
          </div>

          {/* Quantity Selector & Buy Section */}
          <div className="space-y-5 pt-6 border-t border-gray-100">
            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Quantity</span>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || ordering}
                    className="w-8 h-8 rounded-xl bg-white text-slate-600 hover:bg-gray-100 disabled:opacity-40 flex items-center justify-center transition shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity || ordering}
                    className="w-8 h-8 rounded-xl bg-white text-slate-600 hover:bg-gray-100 disabled:opacity-40 flex items-center justify-center transition shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Estimated Total Display (Informational for client UX, server re-verifies!) */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between text-sm bg-brand-50/60 p-4 rounded-2xl border border-brand-100">
                <span className="font-semibold text-brand-900">Calculated Subtotal</span>
                <span className="font-extrabold text-brand-700 text-lg">
                  ${(parseFloat(product.price) * quantity).toFixed(2)}
                </span>
              </div>
            )}

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || ordering}
              className={`w-full py-4 px-6 text-base font-bold rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-[0.99]'
              } ${ordering ? 'opacity-70 cursor-wait' : ''}`}
            >
              <ShoppingBag className="w-5 h-5" />
              {ordering ? 'Placing Order...' : isOutOfStock ? 'Sold Out' : 'Buy Now'}
            </button>

            {/* Trust Points */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Verified Stock Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Immediate Order Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
