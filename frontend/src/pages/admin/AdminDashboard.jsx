import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../api/productService';
import { categoryService } from '../../api/categoryService';
import { orderService } from '../../api/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
  Package,
  Layers,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    placedOrdersCount: 0,
    completedOrdersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [categories, products, orders] = await Promise.all([
          categoryService.getAllCategories(),
          productService.getAllProducts({ ordering: '-created_at' }),
          orderService.getAdminOrders(),
        ]);

        const ordersList = orders || [];
        const productsList = products || [];
        const categoriesList = categories || [];

        // Calculate total revenue from actual order records
        const revenue = ordersList.reduce(
          (acc, order) => acc + parseFloat(order.total_amount || 0),
          0
        );

        const placedCount = ordersList.filter((o) => o.status === 'placed').length;
        const completedCount = ordersList.filter((o) => o.status === 'completed').length;

        setStats({
          totalProducts: productsList.length,
          totalCategories: categoriesList.length,
          totalOrders: ordersList.length,
          totalRevenue: revenue,
          placedOrdersCount: placedCount,
          completedOrdersCount: completedCount,
        });

        setRecentOrders(ordersList.slice(0, 5));
        setLatestProducts(productsList.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading administrative metrics..." />;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      description: 'Calculated from live orders',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      bg: 'bg-brand-50 text-brand-600',
      border: 'border-brand-100',
      description: `${stats.placedOrdersCount} placed, ${stats.completedOrdersCount} completed`,
    },
    {
      title: 'Active Products',
      value: stats.totalProducts,
      icon: Package,
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      description: 'Items in catalog',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: Layers,
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
      description: 'Organized sections',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome to the administrative portal. Monitor catalog metrics and incoming orders.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 bg-white rounded-2xl border ${card.border} shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Orders & Latest Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest purchase transactions</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">
                      No orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">#{ord.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{ord.customer_username}</div>
                        <div className="text-xs text-slate-400">{ord.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">
                        ${parseFloat(ord.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {ord.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3" /> Placed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/admin/orders"
                          className="text-xs font-bold text-brand-600 hover:text-brand-800"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Products Mini List (1 col) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Latest Products</h2>
              <p className="text-xs text-slate-500 mt-0.5">Recently added to inventory</p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 divide-y divide-gray-100">
            {latestProducts.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">No products found.</p>
            ) : (
              latestProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      {p.category_name} &bull; {p.stock_quantity} in stock
                    </p>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 flex-shrink-0">
                    ${parseFloat(p.price).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
