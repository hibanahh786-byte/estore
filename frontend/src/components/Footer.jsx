import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Truck, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0c0c0f] text-white border-t border-white/10 mt-20">
      {/* Features highlight banner */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#2362f6] flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Next Dispatch Guarantee</h4>
                <p className="text-xs text-slate-400">Orders placed before 14:00 ship same day</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#2362f6] flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">2-Year ESTORE Warranty</h4>
                <p className="text-xs text-slate-400">Zero-hassle replacements on all accessories</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#f97316] flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Atomic Stock Lock</h4>
                <p className="text-xs text-slate-400">Server-enforced concurrency inventory safety</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white flex items-center">
              ESTORE<span className="text-[#f97316] text-2xl leading-none">.</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} ESTORE Inc. Engineered for your everyday.
          </p>

          <div className="flex items-center gap-5 text-xs font-bold text-slate-400">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/products" className="hover:text-white transition">Shop All</Link>
            <Link to="/my-orders" className="hover:text-white transition">My Orders</Link>
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
