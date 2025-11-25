// D:\studiosadmin\studiosadmin\components\dashboard\DashboardHeader.tsx
import React from 'react';
import { FiUsers, FiLogOut, FiChevronRight, FiRefreshCw } from "react-icons/fi";

interface DashboardHeaderProps {
    isApiLoading: boolean;
    refreshAllData: () => Promise<void>;
    handleLogout: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isApiLoading, refreshAllData, handleLogout }) => (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-gray-200 sticky top-0 bg-gray-50 z-20">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex flex-col sm:flex-row items-center gap-2 mb-4 md:mb-0 text-center md:text-left text-gray-900">
            <FiUsers className="text-3xl sm:text-4xl text-indigo-600" /> SSI Studios
            <span className="text-gray-500 text-lg sm:text-xl font-medium flex items-center gap-1 mt-1 sm:mt-0 sm:ml-3">
                <FiChevronRight className="text-xl sm:text-2xl" /> User Administration
            </span>
        </h1>
        <div className="flex gap-3">
            <button
                onClick={refreshAllData}
                className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-200 transition-colors text-base font-semibold"
                disabled={isApiLoading}
                title="Refresh Member List and Analytics Data"
            >
                <FiRefreshCw className={`text-lg ${isApiLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 text-base font-semibold"
                disabled={isApiLoading}
            >
                <FiLogOut className="text-lg" /> Log Out
            </button>
        </div>
    </header>
);

export default DashboardHeader;