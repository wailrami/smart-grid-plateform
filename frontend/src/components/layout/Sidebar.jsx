

import { BarChart2, Zap, AlertTriangle, Search, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react'; 

// Sidebar Navigation
export default function Sidebar () {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/', icon: BarChart2, label: 'Platform Overview' },
    { path: '/demand', icon: Zap, label: 'Energy Demand' },
    { path: '/fault', icon: AlertTriangle, label: 'Fault Prediction' },
    { path: '/search', icon: Search, label: 'Fast Timestamp Search' },
  ];

  return (
    <>
      <button
          className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 p-2 rounded"
          onClick={() => setOpen(!open)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6 text-white" />
      </button>
    <nav className={`
          fixed top-0 left-0 h-full w-64 bg-gray-950/50 border-r border-gray-700/50 p-5 flex flex-col z-40
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:block
        `}>
      <div className="flex items-center space-x-3 mb-10">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white">Smart Grid</h1>
      </div>
      <ul className="space-y-2">
        {navItems.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              // onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                location.pathname === item.path
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
       <div className="mt-auto text-center text-gray-500 text-xs">
          <p>&copy; 2025 Smart Grid Platform</p>
          <p>Version 1.1.0</p>
        </div>
    </nav>
    {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};