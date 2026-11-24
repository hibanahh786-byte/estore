import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoryService } from '../api/categoryService';
import { 
  Zap, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ShoppingBag, 
  Search,
  LayoutDashboard,
  ChevronDown,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    categoryService.getAllCategories()
      .then((data) => setCategories(data || []))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Top Announcement Bar (Exact Blue from screenshot) */}
      <div className="bg-[#2362f6] text-white text-xs font-semibold py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/products"
            className="flex items-center gap-1 hover:underline tracking-tight transition"
          >
            <span>Meet your everyday essentials</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] opacity-95">
            <Clock className="w-3.5 h-3.5" />
            <span>Next dispatch: tomorrow &middot; cutoff 14:00 CET/CEST</span>
          </div>
        </div>
      </div>

      {/* Main Header (Deep Matte Black from screenshot) */}
      <div className="bg-[#0c0c0f] border-b border-white/10 px-4 sm:px-8 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          {/* Brand Logo: ⚡ ESTORE. */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:bg-[#2362f6] transition-colors">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white flex items-center">
              ESTORE<span className="text-[#f97316] text-3xl leading-none">.</span>
            </span>
          </Link>

          {/* Center Navigation Links Desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            {/* Shop by category with dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 py-2 hover:text-white transition">
                <span>Shop By Category</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-[#14141c] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-4 py-2 text-[10px] uppercase font-extrabold text-slate-400 border-b border-white/10">
                    Product Categories
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {cat.products_count !== undefined ? `${cat.products_count}` : ''}
                      </span>
                    </Link>
                  ))}
                  <Link
                    to="/products"
                    onClick={() => setCategoriesDropdownOpen(false)}
                    className="block px-4 py-2.5 text-xs font-bold text-[#2362f6] hover:bg-white/5 border-t border-white/10"
                  >
                    View All Categories &rarr;
                  </Link>
                </div>
              )}
            </div>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `hover:text-white transition ${isActive ? 'text-white border-b-2 border-[#2362f6] pb-1' : ''}`
              }
            >
              Shop All
            </NavLink>

            <Link
              to="/products"
              className="flex items-center gap-1.5 hover:text-white transition group"
            >
              <span>Bundles</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#f97316] text-white">
                SAVE
              </span>
            </Link>

            {isAuthenticated && (
              <NavLink
                to="/my-orders"
                className={({ isActive }) =>
                  `hover:text-white transition ${isActive ? 'text-white border-b-2 border-[#2362f6] pb-1' : ''}`
                }
              >
                My Orders
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-xs font-bold text-white bg-purple-900/60 hover:bg-purple-800 px-3 py-1.5 rounded-lg border border-purple-500/30 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-300" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right Section: Search & Bag */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/products"
              className="text-slate-300 hover:text-white transition p-2 rounded-lg hover:bg-white/5"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Shopping Bag Button (Exact style from screenshot: Bag 0) */}
            <Link
              to="/products"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-bold tracking-tight transition"
            >
              <ShoppingBag className="w-4 h-4 text-slate-300" />
              <span>Bag</span>
              <span className="w-5 h-5 rounded-full bg-[#2362f6] text-white text-[11px] font-black flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#2362f6] text-white font-bold flex items-center justify-center text-xs">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-[#14141c] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 text-xs"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Signed in as</p>
                      <p className="font-bold text-white truncate">{user?.username}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      My Orders
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-rose-400 hover:bg-rose-950/30 border-t border-white/10 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#2362f6] hover:bg-blue-600 text-white text-xs font-bold transition shadow-md shadow-blue-600/30"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              to="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white text-xs font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>(0)</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c0c0f] border-b border-white/10 px-6 py-5 space-y-4 text-white">
          <nav className="flex flex-col space-y-2 text-sm font-bold uppercase tracking-wider">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-300 hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-300 hover:text-white"
            >
              Shop All Products
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-slate-300 hover:text-white"
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-purple-400 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-white/10">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 text-rose-300 font-bold text-xs"
              >
                Sign Out ({user?.username})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-[#2362f6] text-white font-bold text-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
