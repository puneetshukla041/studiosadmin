// D:\studiosadmin\studiosadmin\components\dashboard\MockChart.tsx
import React from 'react';
import { FiBarChart2 } from "react-icons/fi";

// --- INTERFACE DEFINITIONS (Repeated for self-containment) ---
interface MockChartProps {
    title: string;
    type: string;
    data: any; 
    color: string;
    dataType: 'distribution' | 'memberUsage';
}

const MockChart: React.FC<MockChartProps> = ({ title }) => {
    const content = (
        <div className="text-center h-48 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
             {/* The chart area is empty as requested */}
        </div>
    );

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-lg h-full">
            <p className={`text-sm font-bold text-gray-800 mb-3 flex items-center gap-2`}>
                <FiBarChart2 className={`text-indigo-600`} /> {title} 
            </p>
            {content}
        </div>
    );
};

export default MockChart;