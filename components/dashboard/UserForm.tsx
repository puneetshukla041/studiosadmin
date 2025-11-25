import React from 'react';
// Added FiImage, FiCamera, FiInfo, FiTrash2, FiStar to the import list
import { 
    FiEdit3, FiUserPlus, FiSettings, FiPlusCircle, FiSave, 
    FiRotateCcw, FiXCircle, FiEye, FiEyeOff, FiImage, 
    FiCamera, FiInfo, FiTrash2, FiStar 
} from "react-icons/fi";
import AccessToggle from './AccessToggle'; // Import the new component
import { IconType } from "react-icons";

// Note: AccessTogglesState would need to be imported or defined here.
interface AccessTogglesState {
    posterEditor: boolean;
    certificateEditor: boolean;
    visitingCard: boolean;
    idCard: boolean;
    bgRemover: boolean;
    imageEnhancer: boolean;
    assets: boolean;
}

interface UserFormProps {
    username: string;
    password: string;
    editingId: string | null;
    isApiLoading: boolean;
    showPassword: boolean;
    accessToggles: AccessTogglesState;
    setUsername: (val: string) => void;
    setPassword: (val: string) => void;
    setShowPassword: (val: boolean) => void;
    setAccessToggles: (updater: (prev: AccessTogglesState) => AccessTogglesState) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleCancelEdit: () => void;
    handleClearForm: () => void;
}

// All icons used here are now imported correctly above
const moduleAccessMap = {
    posterEditor: { label: "Poster Editor", icon: FiImage },
    certificateEditor: { label: "Certificate Editor", icon: FiEdit3 },
    visitingCard: { label: "Visiting Card", icon: FiCamera },
    idCard: { label: "ID Card", icon: FiInfo },
    bgRemover: { label: "BG Remover", icon: FiTrash2 },
    imageEnhancer: { label: "Image Enhancer", icon: FiStar },
    // Assets Manager is removed as per original file's logic
};

const UserForm: React.FC<UserFormProps> = ({
    username, password, editingId, isApiLoading, showPassword, accessToggles,
    setUsername, setPassword, setShowPassword, setAccessToggles,
    handleSubmit, handleCancelEdit, handleClearForm,
}) => (
    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 text-gray-900">
            {editingId ? (
                <>
                    <FiEdit3 className="text-2xl text-orange-500" /> Edit User Profile: 
                    <span className="text-indigo-600 ml-2">{username}</span>
                </>
            ) : (
                <><FiUserPlus className="text-2xl text-indigo-600" /> Create New User Account</>
            )}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Fields */}
            <div className="space-y-5">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text" id="username" autoComplete="username" placeholder="Enter unique username"
                        className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors"
                        value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isApiLoading}
                    />
                </div>
                <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type={showPassword ? "text" : "password"} id="password" autoComplete={editingId ? "off" : "new-password"}
                        placeholder={editingId ? "Enter new password (optional)" : "Set initial password"}
                        className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-colors pr-10"
                        value={password} onChange={(e) => setPassword(e.target.value)} required={!editingId} disabled={isApiLoading}
                    />
                    <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 top-[26px] pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        disabled={isApiLoading}
                    >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Access Toggles for Form */}
            <div className="border border-gray-200 p-4 rounded-xl bg-gray-50 shadow-inner">
                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2 border-b pb-2 border-gray-200">
                    <FiSettings className="text-indigo-500"/> Initial Access Configuration
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(moduleAccessMap).map(([key, { label, icon }]) => (
                        <AccessToggle
                            key={key} label={label} icon={icon as IconType}
                            checked={accessToggles[key as keyof AccessTogglesState]}
                            onChange={() => setAccessToggles(prev => ({
                                ...prev, [key]: !prev[key as keyof AccessTogglesState]
                            }))}
                        />
                    ))}
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-end gap-3 md:col-span-2 pt-2">
                <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 text-base font-semibold"
                    disabled={isApiLoading}
                >
                    {editingId ? (
                        <><FiSave className="text-lg" /> Update User</>
                    ) : (
                        <><FiPlusCircle className="text-lg" /> Add User</>
                    )}
                </button>
                <button
                    type="button" onClick={() => editingId ? handleCancelEdit() : handleClearForm()}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 border border-gray-300 text-gray-700 px-5 py-3 rounded-lg shadow-sm hover:bg-gray-200 transition-all duration-300 text-base font-semibold"
                    disabled={isApiLoading}
                >
                    {editingId ? <><FiXCircle className="text-lg" /> Cancel Edit</> : <><FiRotateCcw className="text-lg" /> Clear Form</>}
                </button>
            </div>
        </form>
    </div>
);

export default UserForm;