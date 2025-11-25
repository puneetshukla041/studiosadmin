// D:\studiosadmin\studiosadmin\components\dashboard\QuickMetrics.tsx
import React from 'react';
import { FiUsers, FiClock, FiGrid, FiStar } from "react-icons/fi";

// Note: Interfaces for StorageData and AccessTogglesState would need to be imported or defined here.
// Assuming they are defined in a shared context or explicitly here:
interface StorageData {
    usedStorageKB: number;
    usedStorageMB: number;
    totalStorageMB: number;
}
interface MemberStats {
    totalMembers: number;
    totalUsageMinutes: string;
    accessDistribution: { 'Image Enhancer': number };
}

interface QuickMetricsProps {
    memberStats: MemberStats;
    storageUsedData: StorageData | null;
    storageUsagePercentage: number;
}

const QuickMetrics: React.FC<QuickMetricsProps> = ({ memberStats, storageUsedData, storageUsagePercentage }) => (
    <div className="lg:col-span-1 space-y-4">
        {/* 1. Total Members */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{memberStats.totalMembers}</p>
            </div>
            <FiUsers className="w-8 h-8 text-indigo-500 bg-indigo-50/20 p-2 rounded-full" />
        </div>
        
        {/* 2. Total Usage (Time-based metric in MINUTES) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Total Usage (Minutes)</p>
                <p className="text-3xl font-bold text-gray-900">{memberStats.totalUsageMinutes}</p>
            </div>
            <FiClock className="w-8 h-8 text-blue-500 bg-blue-50/20 p-2 rounded-full" />
        </div>
        
        {/* 3. Storage Used */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">Storage Used (KB)</p>
                <FiGrid className="w-8 h-8 text-purple-500 bg-purple-50/20 p-2 rounded-full" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
                {storageUsedData ? storageUsedData.usedStorageKB.toFixed(0) : '--'} KB
                <span className="text-lg font-medium text-gray-400 ml-2">({storageUsedData ? storageUsedData.usedStorageMB.toFixed(2) : '--'} MB)</span>
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${storageUsagePercentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${storageUsagePercentage.toFixed(0)}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                {storageUsagePercentage.toFixed(1)}% Used of {storageUsedData?.totalStorageMB || '--'}MB
            </p>
        </div>

        {/* 4. Image Enhancers */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Image Enhancers</p>
                <p className="text-3xl font-bold text-gray-900">{memberStats.accessDistribution['Image Enhancer']}</p>
            </div>
            <FiStar className="w-8 h-8 text-pink-500 bg-pink-50/20 p-2 rounded-full" />
        </div>
    </div>
);

export default QuickMetrics;