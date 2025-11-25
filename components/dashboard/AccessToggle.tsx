// D:\studiosadmin\studiosadmin\components\dashboard\AccessToggle.tsx
import React from 'react';
import { IconType } from "react-icons";

// --- INTERFACE DEFINITIONS ---
interface AccessToggleProps {
    label: string;
    icon: IconType;
    checked: boolean;
    onChange: () => void;
}

// --- CUSTOM ACCESS TOGGLE COMPONENT ---
const AccessToggle: React.FC<AccessToggleProps> = ({ label, icon: Icon, checked, onChange }) => (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 shadow-sm transition-colors duration-200 hover:bg-gray-100">
        <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${checked ? 'text-indigo-600' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${checked ? 'text-gray-800' : 'text-gray-600'} whitespace-nowrap`}>{label}</span>
        </div>
        <label className="inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
            />
            <div className="w-8 h-4 bg-gray-300 rounded-full peer-checked:bg-indigo-600 transition-all duration-300 relative after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
    </div>
);

export default AccessToggle;