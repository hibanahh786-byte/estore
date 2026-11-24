import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../api/orderService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { 
  Package, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderService.getMyOrders();
        setOrders(data || []);
      } catch (err) {
        setError('Failed to fetch your order history.');
        addToast('Failed to load orders.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [addToast]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
      : 'http://localhost:8000';
    return `${base}${url}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your orders..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your previous purchases, receipt snapshots, and live delivery status.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            You haven't placed any orders yet. Explore our product catalog and grab something you love!
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/25 transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Order Header */}
              <div className="p-6 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">ORDER ID</span>
                    <span className="font-extrabold text-slate-900">#{order.id}</span>
                  </div>

                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-xs text-slate-400 block font-semibold">DATE PLACED</span>
                    <span className="text-slate-700 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-xs text-slate-400 block font-semibold">TOTAL AMOUNT</span>
                    <span className="font-extrabold text-brand-600 text-base">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {order.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Clock className="w-3.5 h-3.5" />
                      Placed
                    </span>
                  )}
                </div>
              </div>

              {/* Order Items List */}
              <div className="p-6 divide-y divide-gray-100">
                {order.items &&
                  order.items.map((item) => {
                    const itemImg = getImageUrl(item.product_image);
                    return (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {itemImg ? (
                              <img
                                src={itemImg}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/products/${item.product_id}`}
                              className="text-sm font-bold text-slate-900 hover:text-brand-600 transition"
                            >
                              {item.product_name}
                            </Link>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> &times; ${parseFloat(item.unit_price).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">
                            ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
