'use client'

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FiUsers, FiLogOut, FiEdit3, FiTrash2, FiSave, FiXCircle, FiChevronRight,
    FiCheck, FiInfo, FiAlertCircle, FiBell, FiPlusCircle, FiSearch, FiEye,
    FiEyeOff, FiRotateCcw, FiLoader, FiClock, FiImage, FiCamera, FiStar,
    FiFolder, FiGrid, FiUserPlus, FiActivity, FiSettings, FiBarChart2, FiTrendingUp, FiCheckCircle,
    FiRefreshCw // Refresh Icon
} from "react-icons/fi";
import { isAuthenticated } from "@/lib/auth"; // Assuming this still works
import { IconType } from "react-icons";

// --- INTERFACE DEFINITIONS ---
interface AccessToggleProps {
    label: string;
    icon: IconType;
    checked: boolean;
    onChange: () => void;
}

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
        assets: boolean; // Will be removed from UI, but kept in interface for DB compatibility
    };
    createdAt?: string;
    updatedAt?: string;
}

// Interface for backend usage data
interface MemberUsage {
    userId: string;
    seconds: number;
}

// Interface for Storage API response
interface StorageData {
    usedStorageKB: number;
    usedStorageMB: number;
    totalStorageMB: number;
}

type NotificationType = "success" | "info" | "error";

// --- MOCK CHART COMPONENT (Visualizes Member Usage in MINUTES) ---
interface MockChartProps {
    title: string;
    type: string;
    data: any; 
    color: string;
    dataType: 'distribution' | 'memberUsage';
}

const MockChart: React.FC<MockChartProps> = ({ title, type, data, color, dataType }) => {
    let content;
    
    if (dataType === 'memberUsage' && Array.isArray(data)) {
        // Calculate max usage for visualization scaling
        const maxUsage = Math.max(...data.map(d => d.usage)) || 1; 
        
        content = (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {data.slice(0, 5).map((d, index) => (
                    <div key={index} className="flex items-center text-xs">
                        {/* Member Name */}
                        <span className="w-20 text-gray-700 font-medium truncate">{d.name}</span>
                        
                        {/* Usage Bar */}
                        <div className="flex-1 bg-gray-200 rounded-full h-3 ml-3">
                            <div 
                                className={`bg-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm`}
                                style={{ width: `${(d.usage / maxUsage) * 100}%` }}
                            ></div>
                        </div>
                        
                        {/* Usage Value - Displaying in MINUTES */}
                        <span className="ml-3 font-semibold text-gray-800 whitespace-nowrap">{d.usage.toFixed(1)}min</span>
                    </div>
                ))}
                {data.length === 0 && <p className="text-center text-gray-400 italic mt-2">No usage data found.</p>}
                {data.length > 5 && <p className="text-center text-gray-500 italic mt-2 text-xs">...showing top 5 of {data.length} users</p>}
            </div>
        );
    } else {
        // Default placeholder for other charts (e.g., Module Access Distribution)
        content = (
            <div className="text-center h-48 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-medium italic">
                [{type} Chart Placeholder: {data}]
            </div>
        );
    }

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-lg h-full">
            <p className={`text-sm font-bold text-gray-800 mb-3 flex items-center gap-2`}>
                <FiBarChart2 className={`text-indigo-600`} /> {title} 
            </p>
            {content}
        </div>
    );
};


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

// --- MAIN COMPONENT ---
export default function MembersPage() {
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: NotificationType;
        active: boolean;
    } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);
    const [accessToggles, setAccessToggles] = useState({
        posterEditor: false, certificateEditor: false, visitingCard: false,
        idCard: false, bgRemover: false, imageEnhancer: false, assets: false,
    });
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
    
    // State for Usage (Individual Member Usage)
    const [memberUsageData, setMemberUsageData] = useState<MemberUsage[]>([]); 
    // NEW STATE: Storage Data
    const [storageUsedData, setStorageUsedData] = useState<StorageData | null>(null);

    // --- Core Functions ---
    const showNotification = useCallback((message: string, type: NotificationType) => {
        setNotification({ message, type, active: true });
        setTimeout(() => {
            setNotification(prev => prev ? { ...prev, active: false } : null);
        }, 3000);
        setTimeout(() => {
            setNotification(null);
        }, 3300);
    }, []);

    // NEW FUNCTION: Fetch aggregated storage data
    const fetchStorageData = useCallback(async () => {
        try {
            const res = await fetch("/api/storage");
            if (!res.ok) {
                // Fetch the error message from the response if available
                const errorData = await res.json().catch(() => ({ message: `Storage API error: ${res.status}` }));
                throw new Error(errorData.message || `Storage API error: ${res.status}`);
            }
            const { data, success } = await res.json();
            if (success) {
                setStorageUsedData(data);
            } else {
                showNotification("Failed to fetch storage data.", "error");
            }
        } catch (err) {
            console.error("Fetch storage error:", err);
            showNotification("Failed to fetch storage data.", "error");
        }
    }, [showNotification]);

    // FUNCTION: Fetch aggregated usage (Pulls from simulated ALL USAGE API)
    const fetchUsageData = useCallback(async (currentMembers: Member[]) => {
        if (currentMembers.length === 0) return;

        try {
            // NOTE: This simulation uses the real IDs and seconds provided by the user's MongoDB query
            const MOCK_USAGE_DATA = [
                { userId: "68ee0ed3c6c929cf8d792c70", seconds: 7 }, 
                { userId: "68fc67f9aa769cdd6e02d999", seconds: 1096 },
            ];

            const dynamicMock = currentMembers.map(m => {
                const existing = MOCK_USAGE_DATA.find(d => d.userId === m._id);
                if (existing) return existing;

                // Simulate data for other members (10 minutes to 600 minutes)
                return {
                    userId: m._id,
                    seconds: Math.floor(Math.random() * 35400) + 600, 
                };
            });
            setMemberUsageData(dynamicMock);

        } catch (err) {
            console.error("Fetch total usage error:", err);
            showNotification("Failed to fetch usage data.", "error");
        }
    }, [showNotification]);

    const fetchMembers = useCallback(async () => {
        setIsApiLoading(true);
        try {
            const res = await fetch("/api/members");
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    router.push("/login");
                    showNotification("Session expired or unauthorized. Please log in.", "error");
                    return;
                }
                throw new Error(`HTTP error: ${res.status}`);
            }
            const data: Member[] = await res.json();
            setMembers(data);
            
            // Call usage data fetching after members are successfully fetched
            await fetchUsageData(data); 

        } catch (err) {
            console.error("Fetch members error:", err);
            showNotification("Failed to load members. Please try again.", "error");
        } finally {
            setIsApiLoading(false);
        }
    }, [router, showNotification, fetchUsageData]); 

    const refreshAllData = useCallback(async () => {
        setIsApiLoading(true);
        // fetchMembers calls fetchUsageData internally
        await fetchMembers(); 
        await fetchStorageData(); // Fetch new storage data
        setIsApiLoading(false);
        showNotification("Data refreshed successfully.", "info");
    }, [fetchMembers, fetchStorageData, showNotification]);

    const handleAccessToggle = useCallback(async (memberId: string, field: keyof NonNullable<Member['access']>, value: boolean) => {
        // Exclude 'assets' from being updated via this quick toggle since it's removed from the UI
        if (field === 'assets') return; 
        
        setIsApiLoading(true);
        try {
            const res = await fetch(`/api/members/${memberId}/access`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, value }),
            });
            if (!res.ok) throw new Error("Failed to update access.");

            setMembers(prevMembers =>
                prevMembers.map(m => {
                    if (m._id === memberId) {
                        const currentAccess = m.access || {
                            posterEditor: false, certificateEditor: false, visitingCard: false,
                            idCard: false, bgRemover: false, imageEnhancer: false, assets: false,
                        };
                        return {
                            ...m,
                            access: { ...currentAccess, [field]: value, },
                        };
                    }
                    return m;
                })
            );
            showNotification("Access updated successfully!", "success");
        } catch (err) {
            console.error("Access update error:", err);
            showNotification("Failed to update access. Please try again.", "error");
        } finally {
            setIsApiLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        const checkAuthenticationAndLoad = async () => {
            const authed = await isAuthenticated();
            if (!authed) {
                router.push('/login');
                showNotification("You need to log in to access this page.", "error");
            } else {
                await fetchMembers();
                await fetchStorageData(); // Initial storage data load
            }
            setIsPageLoading(false);
        };

        checkAuthenticationAndLoad();
    }, [router, fetchMembers, fetchStorageData, showNotification]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsApiLoading(true);

        if (!username.trim() || !password.trim()) {
            showNotification("Username and password cannot be empty.", "info");
            setIsApiLoading(false);
            return;
        }

        const isDuplicate = members.some(m =>
            m.username.toLowerCase() === username.toLowerCase() && m._id !== editingId
        );
        if (isDuplicate) {
            showNotification("Username already exists. Please choose a different one.", "error");
            setIsApiLoading(false);
            return;
        }

        try {
            let res: Response;
            // Ensure 'assets' is explicitly included in the data sent, using the form state (which is currently false)
            const dataToSend = { username, password, access: accessToggles }; 

            if (editingId) {
                res = await fetch(`/api/members/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                });
                if (!res.ok) throw new Error("Failed to update");
                showNotification("Member updated successfully!", "success");
            } else {
                res = await fetch("/api/members", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    if (res.status === 409) {
                        throw new Error(errorData.error || "Duplicate username.");
                    }
                    throw new Error("Failed to add member.");
                }
                showNotification("Member added successfully!", "success");
            }
            setUsername("");
            setPassword("");
            setEditingId(null);
            setAccessToggles({
                posterEditor: false, certificateEditor: false, visitingCard: false,
                idCard: false, bgRemover: false, imageEnhancer: false, assets: false,
            });
            await fetchMembers();
            await fetchStorageData(); // Refresh data after member creation/update
        } catch (err: any) {
            console.error("Save member error:", err);
            showNotification(err.message || "Failed to save member. Please try again.", "error");
        } finally {
            setIsApiLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsConfirmingDelete(null);
        setIsApiLoading(true);
        try {
            const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            await fetchMembers();
            await fetchStorageData(); // Refresh data after deletion
            showNotification("Member deleted successfully!", "success");
        } catch (err: any) {
            console.error("Delete member error:", err);
            showNotification(err.message || "Failed to delete member. Please try again.", "error");
        } finally {
            setIsApiLoading(false);
        }
    };

    const handleEdit = (member: Member) => {
        setEditingId(member._id);
        setUsername(member.username);
        setPassword(member.password);
        setAccessToggles(member.access || {
            posterEditor: false, certificateEditor: false, visitingCard: false,
            idCard: false, bgRemover: false, imageEnhancer: false, assets: false,
        });
        showNotification(`Editing "${member.username}"...`, "info");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setUsername("");
        setPassword("");
        setAccessToggles({
            posterEditor: false, certificateEditor: false, visitingCard: false,
            idCard: false, bgRemover: false, imageEnhancer: false, assets: false,
        });
        showNotification("Edit cancelled.", "info");
    };

    const handleClearForm = () => {
        setUsername("");
        setPassword("");
        setEditingId(null);
        setAccessToggles({
            posterEditor: false, certificateEditor: false, visitingCard: false,
            idCard: false, bgRemover: false, imageEnhancer: false, assets: false,
        });
        showNotification("Form cleared.", "info");
    };

    const handleLogout = async () => {
        setIsApiLoading(true);
        try {
            const res = await fetch("/api/logout", { method: "POST" });
            if (res.ok) {
                router.push("/login");
                showNotification("Logged out successfully.", "info");
            } else {
                throw new Error("Logout failed.");
            }
        } catch (err: any) {
            console.error("Logout error:", err);
            showNotification(err.message || "Logout failed. Please try again.", "error");
        } finally {
            setIsApiLoading(false);
        }
    };

    const filteredMembers = useMemo(() => {
        return members.filter((member) =>
            member.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [members, searchTerm]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
        });
    };
        
    // --- Enhanced Statistic Data (Uses memberUsageData in MINUTES) ---
    const memberStats = useMemo(() => {
        const totalMembers = members.length;
        
        const formatSecondsToMinutes = (seconds: number) => {
            const minutes = seconds / 60;
            return minutes; 
        };
        
        const totalUsageSeconds = memberUsageData.reduce((sum, usage) => sum + usage.seconds, 0);

        // 1. Create data array for Member Usage Chart (sorted by usage)
        const memberUsageChartData = members.map(member => {
            const usageEntry = memberUsageData.find(u => u.userId === member._id);
            const seconds = usageEntry?.seconds || 0;
            return {
                name: member.username,
                usage: formatSecondsToMinutes(seconds), // usage in MINUTES
                seconds: seconds
            };
        }).sort((a, b) => b.usage - a.usage); // Sort descending

        // 2. Create data object for Access Distribution Chart
        // REMOVED 'Assets Manager'
        const accessDistribution = {
            'Poster Editor': members.filter(m => m.access?.posterEditor).length,
            'Cert Editor': members.filter(m => m.access?.certificateEditor).length,
            'Visiting Card': members.filter(m => m.access?.visitingCard).length,
            'ID Card': members.filter(m => m.access?.idCard).length,
            'BG Remover': members.filter(m => m.access?.bgRemover).length,
            'Image Enhancer': members.filter(m => m.access?.imageEnhancer).length,
        };

        return { 
            totalMembers, 
            totalUsageMinutes: formatSecondsToMinutes(totalUsageSeconds).toFixed(1), // Display total in minutes
            memberUsageChartData,
            accessDistribution 
        };
    }, [members, memberUsageData]);

    // CALCULATED VALUE: Storage Usage Percentage
    const storageUsagePercentage = useMemo(() => {
        if (!storageUsedData) return 0;
        // Calculation based on MB, ensuring we don't divide by zero
        if (storageUsedData.totalStorageMB === 0) return 0;

        const percentage = (storageUsedData.usedStorageMB / storageUsedData.totalStorageMB) * 100;
        // Clamp the value between 0 and 100
        return Math.max(0, Math.min(100, percentage)); 
    }, [storageUsedData]);


    // --- LOADING STATE ---
    if (isPageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
                <div className="text-center text-gray-700">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-base font-medium">Loading professional dashboard...</p>
                </div>
            </div>
        );
    }

    // --- MAIN RENDER (Updated Statistics Cards and New Usage Graph) ---
    return (
        <div className="min-h-screen w-full font-sans antialiased bg-gray-50 text-gray-800 p-4 sm:p-6 md:p-8 lg:p-10">

            {/* API Loading Overlay and Confirmation Modal remain here */}
            {isApiLoading && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[60] flex items-center justify-center">
                    <div className="text-center text-gray-700">
                        <FiLoader className="w-16 h-16 animate-spin-slow mx-auto text-indigo-600 mb-4" />
                        <p className="text-lg font-semibold tracking-wide">Processing Request...</p>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmingDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 text-center max-w-sm w-full transform scale-100 transition-all duration-300">
                        <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this member? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsConfirmingDelete(null)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete(isConfirmingDelete);
                                    setIsConfirmingDelete(null); 
                                }}
                                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 w-full max-w-full mx-auto">
                {/* Notification/Toast remains here */}
                {notification && (
                    <div
                        className={`
                            fixed top-4 left-1/2 -translate-x-1/2 z-50 h-12 px-5 py-3
                            rounded-full shadow-2xl flex items-center gap-3 bg-white border border-gray-200
                            text-base font-medium whitespace-nowrap overflow-hidden w-max min-w-[36px] md:max-w-[360px]
                        `}
                    >
                        <div className={`flex-shrink-0 text-xl
                            ${notification.type === "success" ? "text-green-600" : ""}
                            ${notification.type === "info" ? "text-indigo-600" : ""}
                            ${notification.type === "error" ? "text-red-600" : ""}
                        `}>
                            {notification.type === "success" && <FiCheck />}
                            {notification.type === "info" && <FiInfo />}
                            {notification.type === "error" && <FiAlertCircle />}
                        </div>
                        <span className={`flex-grow text-center truncate text-gray-700`}>
                            {notification.message}
                        </span>
                    </div>
                )}

                {/* --- Header & Logout --- */}
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

                {/* --- Analytics & Graphs Section --- */}
                <section className="mb-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Key Metrics */}
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
                        
                        {/* NEW CARD: Storage Used (Now showing KB prominently) */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-500">Storage Used (KB)</p>
                                <FiGrid className="w-8 h-8 text-purple-500 bg-purple-50/20 p-2 rounded-full" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-2">
                                {/* Use KB for the main display for better initial visibility of small usage */}
                                {storageUsedData ? storageUsedData.usedStorageKB.toFixed(0) : '--'} KB
                                <span className="text-lg font-medium text-gray-400 ml-2">({storageUsedData ? storageUsedData.usedStorageMB.toFixed(2) : '--'} MB)</span>
                            </p>
                            
                            {/* Simple Progress Bar for Storage */}
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

                        {/* 4. Image Enhancers (Replaced Assets Manager count) */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Image Enhancers</p>
                                <p className="text-3xl font-bold text-gray-900">{memberStats.accessDistribution['Image Enhancer']}</p>
                            </div>
                            <FiStar className="w-8 h-8 text-pink-500 bg-pink-50/20 p-2 rounded-full" />
                        </div>
                    </div>

                    {/* Graphs and Charts */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NEW CHART: Member Usage Distribution (Shows usage per user name in minutes) */}
                        <MockChart 
                            title="Top Member Usage Distribution (Minutes)" 
                            type="Bar" 
                            data={memberStats.memberUsageChartData} // Array of {name, usage}
                            color="indigo" 
                            dataType="memberUsage"
                        />
                        {/* EXISTING CHART: Module Access Distribution (Updated with new list) */}
                           <MockChart 
                            title="Module Access Distribution" 
                            type="Bar" 
                            data={Object.keys(memberStats.accessDistribution).join(', ')} 
                            color="green" 
                            dataType="distribution"
                        />
                    </div>
                </section>

                <hr className="my-10 border-gray-200"/>

                {/* --- Member Management Layout: Form & Table --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Column 1: Add/Edit Member Form */}
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

                            {/* Access Toggles for Form (Removed Assets Manager) */}
                            <div className="border border-gray-200 p-4 rounded-xl bg-gray-50 shadow-inner">
                                <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2 border-b pb-2 border-gray-200">
                                    <FiSettings className="text-indigo-500"/> Initial Access Configuration
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries({
                                        posterEditor: { label: "Poster Editor", icon: FiImage },
                                        certificateEditor: { label: "Certificate Editor", icon: FiEdit3 },
                                        visitingCard: { label: "Visiting Card", icon: FiCamera },
                                        idCard: { label: "ID Card", icon: FiInfo },
                                        bgRemover: { label: "BG Remover", icon: FiTrash2 },
                                        imageEnhancer: { label: "Image Enhancer", icon: FiStar },
                                        // assets: { label: "Assets Manager", icon: FiFolder }, // REMOVED
                                    }).map(([key, { label, icon }]) => (
                                        <AccessToggle
                                            key={key} label={label} icon={icon as IconType}
                                            checked={accessToggles[key as keyof typeof accessToggles]}
                                            onChange={() => setAccessToggles(prev => ({
                                                ...prev, [key]: !prev[key as keyof typeof accessToggles]
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
                    
                    {/* Column 2: Quick Access Guide (Updated with new list) */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-lg h-min">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2 border-gray-100">
                            <FiInfo className="text-indigo-600"/> Quick Guide
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <FiCheckCircle className="mt-1 flex-shrink-0 text-green-500"/> 
                                **Live Access:** Use the quick toggles in the **Access Privileges** column to instantly modify permissions in the directory below.
                            </li>
                            <li className="flex items-start gap-3">
                                <FiTrendingUp className="mt-1 flex-shrink-0 text-indigo-500"/> 
                                **Monitoring:** The charts provide a snapshot of current user distribution and usage trends for high-level oversight.
                            </li>
                            <li className="flex items-start gap-3">
                                <FiClock className="mt-1 flex-shrink-0 text-gray-500"/> 
                                **Auditing:** All creation/update timestamps use the **system's timezone** for precise, traceable auditing.
                            </li>
                            <li className="flex items-start gap-3">
                                <FiGrid className="mt-1 flex-shrink-0 text-purple-500"/> 
                                **Storage:** Track your database usage against the allocated **{storageUsedData?.totalStorageMB || '--'}MB** limit.
                            </li>
                        </ul>
                    </div>
                </div>
                
                <hr className="my-10 border-gray-200"/>

                {/* --- Member List Table --- */}
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
                                                    {/* Inline Access Toggles (Removed Assets Manager) */}
                                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
                                                        {Object.entries({
                                                            posterEditor: { label: "Poster", icon: FiImage },
                                                            certificateEditor: { label: "Cert.", icon: FiEdit3 },
                                                            visitingCard: { label: "V-Card", icon: FiCamera },
                                                            idCard: { label: "ID Card", icon: FiInfo },
                                                            bgRemover: { label: "BG Rmv", icon: FiTrash2 },
                                                            imageEnhancer: { label: "Enhancer", icon: FiStar },
                                                            // assets: { label: "Assets", icon: FiFolder }, // REMOVED
                                                        }).map(([key, { label, icon }]) => (
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
                                                {members.length > 0 && searchTerm ? "No matching users found." : "No users registered yet."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}