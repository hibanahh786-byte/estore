import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingBag,
  Store,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Categories', path: '/admin/categories', icon: Layers, end: false },
    { label: 'Products', path: '/admin/products', icon: Package, end: false },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, end: false },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Admin<span className="text-brand-400">Portal</span>
              </span>
            </Link>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Card */}
          <div className="px-6 py-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600/30 text-brand-400 font-bold flex items-center justify-center text-sm border border-brand-500/30">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-white truncate">{user?.username || 'Admin'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Store className="w-5 h-5 text-brand-400" />
            Customer Storefront
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
