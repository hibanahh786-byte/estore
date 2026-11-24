import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../../api/orderService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Eye,
  Calendar,
  User,
  Mail,
  X,
  Package,
  Check,
  Loader2,
  DollarSign,
  ArrowUpDown,
} from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { addToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await orderService.getAdminOrders(params);
      setOrders(data || []);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to fetch orders.');
      addToast('Error loading orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchOrders();
  };

  const handleMarkAsCompleted = async (orderId) => {
    setUpdatingStatus(true);
    try {
      const res = await orderService.updateOrderStatus(orderId, 'completed');
      addToast(`Order #${orderId} marked as Completed.`, 'success');

      // Update state locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: 'completed' }));
      }
    } catch (err) {
      addToast('Failed to update order status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return orders.slice(start, start + itemsPerPage);
  }, [orders, currentPage]);

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Customer Orders
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review customer purchases, inspect order items snapshot, and update delivery fulfillment status.
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'placed', label: 'Placed (Pending)' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => {
              setSearch('');
              fetchOrders();
            }}
            placeholder="Search by order ID, username..."
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Loading orders..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Placed</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      No orders found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">#{ord.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{ord.customer_username}</div>
                        <div className="text-xs text-slate-400">{ord.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {ord.items_count || (ord.items ? ord.items.length : 0)} items
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        ${parseFloat(ord.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {ord.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3.5 h-3.5" /> Placed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(ord.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 rounded-xl transition inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Order Details #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Placed on {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Customer Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Customer Account
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <User className="w-4 h-4 text-brand-600" />
                    {selectedOrder.customer_username}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedOrder.customer_email}
                  </div>
                </div>

                <div className="space-y-1 sm:border-l sm:border-gray-200 sm:pl-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Order Status
                  </span>
                  <div>
                    {selectedOrder.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <Clock className="w-3.5 h-3.5" /> Placed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Purchased Items Snapshot
                </h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {selectedOrder.items &&
                    selectedOrder.items.map((item) => {
                      const img = getImageUrl(item.product_image);
                      return (
                        <div
                          key={item.id}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {img ? (
                                <img
                                  src={img}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                Snapshot Unit Price: ${parseFloat(item.unit_price).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                            <div className="text-sm font-black text-slate-900">
                              ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Total Calculation Row */}
              <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-900 uppercase tracking-wider block">
                    Server-Verified Total
                  </span>
                  <span className="text-xs text-brand-700">Authoritative database calculation</span>
                </div>
                <span className="text-2xl font-black text-brand-900">
                  ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition shadow-sm"
              >
                Close
              </button>

              {selectedOrder.status === 'placed' && (
                <button
                  type="button"
                  onClick={() => handleMarkAsCompleted(selectedOrder.id)}
                  disabled={updatingStatus}
                  className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Mark as Completed
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
