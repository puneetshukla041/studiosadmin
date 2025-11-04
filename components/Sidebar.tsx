'use client'

import { useState } from "react";
import {
  FiBriefcase, FiList, FiUsers, FiDollarSign, FiActivity, FiFolder,
  FiSettings, FiLogOut, FiMenu, FiXCircle,
} from "react-icons/fi";

// Define the structure for a sidebar item
interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  current: boolean;
}

// Mock Navigation Data (Adjust as needed for your application)
const navigation: NavItem[] = [
  { icon: FiBriefcase, label: "Dashboard", href: "#dashboard", current: true },
  { icon: FiList, label: "Tasks", href: "#tasks", current: false },
  { icon: FiUsers, label: "Members", href: "#members", current: false },
  { icon: FiFolder, label: "Assets", href: "#assets", current: false },
  { icon: FiActivity, label: "Analytics", href: "#analytics", current: false },
  { icon: FiDollarSign, label: "Finance", href: "#finance", current: false },
];

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  // Use state to track the active item (for visual indication)
  const [activeItem, setActiveItem] = useState("Dashboard");
  
  // A helper function to determine if the icon/label should be shown
  const isLargeScreen = () => window.innerWidth >= 1024; // Tailwind's 'lg' breakpoint

  return (
    <>
      {/* Mobile Sidebar Overlay (when open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={toggle}
        />
      )}

      {/* Main Sidebar Structure */}
      <aside
        className={`
          fixed inset-y-0 left-0 
          bg-white border-r border-gray-200 shadow-xl z-50 
          h-screen flex flex-col 
          transition-all duration-300 ease-in-out
          
          ${isOpen ? 'w-64 transform translate-x-0' : 'w-0 transform -translate-x-full'} 
          
          md:w-20 md:transform md:translate-x-0
          lg:w-64 lg:flex-shrink-0 
        `}
      >
        {/* Logo/Header Section */}
        <div className="p-4 flex items-center justify-between h-16 border-b border-gray-100">
          <div className={`flex items-center transition-opacity duration-300 ${isLargeScreen() ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
             <FiBriefcase className="w-6 h-6 text-blue-600 mr-2" />
             <span className="text-xl font-bold text-gray-800 hidden lg:block">Team Space</span>
          </div>
          
          {/* Close button for mobile */}
          <button onClick={toggle} className="text-gray-500 hover:text-gray-700 p-1 md:hidden">
            <FiXCircle className="w-6 h-6" />
          </button>

          {/* Icon for collapsed md view (Hidden on lg/full view) */}
          <div className="hidden md:block lg:hidden">
            <FiMenu className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto pt-4 pb-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.label} onClick={() => setActiveItem(item.label)}>
                <a
                  href={item.href}
                  className={`
                    flex items-center rounded-lg p-2.5 text-sm font-medium
                    transition-colors duration-200
                    ${activeItem === item.label 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${!isLargeScreen() ? 'justify-center lg:justify-start' : 'justify-start'}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${activeItem === item.label ? 'text-white' : 'text-gray-500'} mr-3 lg:mr-0 md:mr-0 lg:flex-shrink-0`} />
                  <span className={`transition-opacity duration-300 ${!isLargeScreen() ? 'hidden lg:inline' : 'inline'}`}>
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer/Settings/Logout */}
        <div className="border-t border-gray-100 p-4 space-y-2">
           <a
              href="#settings"
              className="flex items-center rounded-lg p-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
           >
              <FiSettings className="w-5 h-5 text-gray-500 mr-3 lg:mr-0 md:mr-0 lg:flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${!isLargeScreen() ? 'hidden lg:inline' : 'inline'}`}>
                Settings
              </span>
           </a>
           <a
              href="#logout"
              className="flex items-center rounded-lg p-2.5 text-sm font-medium text-red-600 hover:bg-red-50/50"
           >
              <FiLogOut className="w-5 h-5 text-red-500 mr-3 lg:mr-0 md:mr-0 lg:flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${!isLargeScreen() ? 'hidden lg:inline' : 'inline'}`}>
                Logout
              </span>
           </a>
        </div>
      </aside>
    </>
  );
}