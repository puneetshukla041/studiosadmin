import React from 'react';
import { 
    FiUsers, FiSearch, FiClock, FiEye, FiEyeOff, FiEdit3, FiTrash2, FiImage, FiInfo, FiCamera, FiStar 
} from "react-icons/fi"; // FiStar has been added here
import { IconType } from "react-icons";

// Note: Member and AccessTogglesState interfaces would need to be imported or defined here.
interface Member {
    _id: string;
    username: string;
    password: string;
    access?: {
        posterEditor: boolean;
        certificateEditor: boolean;
        visitingCard: boolean;
        idCard: boolean;
        bgRemover: boolean;
        imageEnhancer: boolean;
        assets: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface UserTableProps {
    filteredMembers: Member[];
    searchTerm: string;
    editingId: string | null;
    isApiLoading: boolean;
    visiblePasswordId: string | null;
    setSearchTerm: (val: string) => void;
    setVisiblePasswordId: (updater: (prevId: string | null) => string | null) => void;
    handleAccessToggle: (memberId: string, field: keyof NonNullable<Member['access']>, value: boolean) => Promise<void>;
    handleEdit: (member: Member) => void;
    setIsConfirmingDelete: (id: string | null) => void;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
};

const inlineAccessMap = {
    posterEditor: { label: "Poster", icon: FiImage },
    certificateEditor: { label: "Cert.", icon: FiEdit3 },
    visitingCard: { label: "V-Card", icon: FiCamera },
    idCard: { label: "ID Card", icon: FiInfo },
    bgRemover: { label: "BG Rmv", icon: FiTrash2 },
    imageEnhancer: { label: "Enhancer", icon: FiStar },
    // Assets manager is removed
};

const UserTable: React.FC<UserTableProps> = ({
    filteredMembers, searchTerm, editingId, isApiLoading, visiblePasswordId,
    setSearchTerm, setVisiblePasswordId, handleAccessToggle, handleEdit, setIsConfirmingDelete,
}) => (
    <section>
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-lg w-full">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FiUsers className="text-xl text-indigo-600" /> User Directory ({filteredMembers.length})
                </h3>
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search users by username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                        disabled={isApiLoading}
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><FiClock className="text-sm" /> Created At</span>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><FiClock className="text-sm" /> Updated At</span>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Access Privileges</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredMembers.length > 0 ? (
                            filteredMembers.map((m) => (
                                <tr
                                    key={m._id}
                                    className={`transition-all duration-300 ${editingId === m._id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 text-sm font-medium">{m.username}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-sm relative">
                                        <div className="flex items-center gap-2">
                                            <span>{visiblePasswordId === m._id ? m.password : "••••••••"}</span>
                                            <button
                                                type="button" onClick={() => setVisiblePasswordId(prevId => (prevId === m._id ? null : m._id))}
                                                className="p-1 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                                                disabled={isApiLoading}
                                            >
                                                {visiblePasswordId === m._id ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{formatDate(m.createdAt)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{formatDate(m.updatedAt)}</td>
                                    <td className="px-4 py-3">
                                        {/* Inline Access Toggles */}
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
                                            {Object.entries(inlineAccessMap).map(([key, { label, icon }]) => (
                                                <div key={key} className="flex items-center justify-between p-1 border border-gray-200 rounded-md bg-white shadow-xs">
                                                    <div className="flex items-center gap-1">
                                                        {(icon as IconType)({ className: `w-3 h-3 ${m.access?.[key as keyof NonNullable<Member['access']>] ? 'text-indigo-500' : 'text-gray-400'}` })}
                                                        <span className={`text-[10px] font-medium ${m.access?.[key as keyof NonNullable<Member['access']>] ? 'text-gray-700' : 'text-gray-500'} whitespace-nowrap`}>{label}</span>
                                                    </div>
                                                    <label className="inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox" className="sr-only peer"
                                                            checked={m.access?.[key as keyof NonNullable<Member['access']>] || false}
                                                            onChange={() => handleAccessToggle(m._id, key as keyof NonNullable<Member['access']>, !(m.access?.[key as keyof NonNullable<Member['access']>] || false))}
                                                        />
                                                        <div className="w-5 h-2.5 bg-gray-300 rounded-full peer-checked:bg-indigo-500 transition-all relative after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:after:translate-x-2.5"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                                        <button
                                            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-all duration-200 text-xs font-semibold shadow-sm"
                                            onClick={() => handleEdit(m)} disabled={isApiLoading}
                                        >
                                            <FiEdit3 className="w-4 h-4" /> Edit
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-all duration-200 text-xs font-semibold shadow-sm"
                                            onClick={() => setIsConfirmingDelete(m._id)} disabled={isApiLoading}
                                        >
                                            <FiTrash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500 text-sm italic">
                                    {searchTerm ? "No matching users found." : "No users registered yet."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
);

export default UserTable;