import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth"; 

// --- INTERFACE DEFINITIONS ---
interface BugReport {
    _id: string;
    userId: string;
    title: string;
    username: string; 
    description: string;
    rating: number;
    status: string; 
    createdAt: string; 
    resolutionMessage?: string; 
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
        assets: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface MemberUsage {
    userId: string;
    seconds: number;
}

interface StorageData {
    usedStorageKB: number;
    usedStorageMB: number;
    totalStorageMB: number;
}

type NotificationType = "success" | "info" | "error";

interface AccessTogglesState {
    posterEditor: boolean;
    certificateEditor: boolean;
    visitingCard: boolean;
    idCard: boolean;
    bgRemover: boolean;
    imageEnhancer: boolean;
    assets: boolean;
}

const initialAccessToggles: AccessTogglesState = {
    posterEditor: false, certificateEditor: false, visitingCard: false,
    idCard: false, bgRemover: false, imageEnhancer: false, assets: false,
};

export const useMemberData = () => {
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
    const [accessToggles, setAccessToggles] = useState<AccessTogglesState>(initialAccessToggles);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
    const [bugReports, setBugReports] = useState<BugReport[]>([]);
    const [memberUsageData, setMemberUsageData] = useState<MemberUsage[]>([]); 
    const [storageUsedData, setStorageUsedData] = useState<StorageData | null>(null);

    // --- Core Utility Functions ---
    const showNotification = useCallback((message: string, type: NotificationType) => {
        setNotification({ message, type, active: true });
        setTimeout(() => {
            setNotification(prev => prev ? { ...prev, active: false } : null);
        }, 3000);
        setTimeout(() => {
            setNotification(null);
        }, 3300);
    }, []);

    const fetchUsageData = useCallback(async (currentMembers: Member[]) => {
        if (currentMembers.length === 0) return;
        try {
            // MOCK data remains here as no live usage API was provided
            const MOCK_USAGE_DATA = [
                { userId: "68ee0ed3c6c929cf8d792c70", seconds: 7 }, 
                { userId: "68fc67f9aa769cdd6e02d999", seconds: 1096 },
            ];

            const dynamicMock = currentMembers.map(m => {
                const existing = MOCK_USAGE_DATA.find(d => d.userId === m._id);
                if (existing) return existing;

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

    const fetchStorageData = useCallback(async () => {
        try {
            const res = await fetch("/api/storage");
            if (!res.ok) {
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

    const fetchBugReports = useCallback(async () => {
        try {
            const res = await fetch("/api/bug-reports"); 
            if (!res.ok) {
                throw new Error(`Failed to fetch bug reports. Status: ${res.status}`);
            }
            const data: BugReport[] = await res.json();
            const mappedReports = data.map(report => ({
                ...report,
                username: report.username || (report.userId.length > 10 ? `User ${report.userId.substring(0, 4)}...` : 'Unknown')
            }));
            setBugReports(mappedReports);
        } catch (err) {
            console.error("Fetch bug reports error:", err);
            setBugReports([]); 
        }
    }, []);

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
            await fetchUsageData(data); 
        } catch (err) {
            console.error("Fetch members error:", err);
            showNotification("Failed to load members. Please try again.", "error");
        } finally {
            setIsApiLoading(false);
        }
    }, [router, showNotification, fetchUsageData]); 

    // --- Data Refetch Function ---
    const refreshAllData = useCallback(async () => {
        setIsApiLoading(true);
        // Using Promise.allSettled allows one failed fetch (like 405) not to stop others
        await Promise.allSettled([
            fetchMembers(), 
            fetchStorageData(), 
            fetchBugReports(), 
        ]);
        setIsApiLoading(false);
        showNotification("Data refreshed successfully.", "info");
    }, [fetchMembers, fetchStorageData, fetchBugReports, showNotification]);

    // --- ACTION: Resolve Bug Report ---
    const handleResolveReport = useCallback(async (reportId: string, resolutionMessage: string) => {
        setIsApiLoading(true);
        try {
            const res = await fetch(`/api/bug-reports/resolve/${reportId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resolutionMessage }), 
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "API resolution failed." }));
                throw new Error(errorData.error || `Failed to resolve ticket: ${res.status}`);
            }

            const updatedReport: BugReport = await res.json(); 

            setBugReports(prevReports => 
                prevReports.map(report => 
                    report._id === reportId ? updatedReport : report 
                )
            );

            showNotification(`Ticket ${reportId.substring(0, 8)}... resolved and message saved!`, "success");
            
        } catch (error: any) {
            console.error("Ticket resolution failed:", error);
            showNotification(error.message || "Failed to close ticket. Check API logs.", "error");
        } finally {
            setIsApiLoading(false);
        }
    }, [showNotification]);
    // ----------------------------------------------------------------------

    /**
     * 🟢 FIX: Redefining handleAccessToggle signature and logic to correctly handle:
     * 1. The call order used by page.tsx: (field, value, memberId)
     * 2. Local state update for new users (memberId === null)
     * 3. Server API call for existing users (memberId is a string)
     */
    const handleAccessToggle = useCallback(async (
        field: keyof AccessTogglesState,
        value: boolean,
        memberId: string | null 
    ) => {
        if (field === 'assets') return; 

        // 1. Always update local form state first (for both new/edit modes)
        if (memberId === editingId) {
            setAccessToggles(prev => ({
                ...prev,
                [field]: value,
            }));
        }

        // 2. Only proceed with API call if an existing member is being edited
        if (!memberId || memberId === 'local') { // 'local' check added for robustness if component passes it
            // We successfully updated local state, now we exit.
            return;
        }

        // --- Server Update Logic (Only for existing members) ---
        setIsApiLoading(true);
        try {
            const res = await fetch(`/api/members/${memberId}/access`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, value }),
            });
            
            if (!res.ok) throw new Error("Failed to update access.");

            // Optimistic update of the members list in state
            setMembers(prevMembers =>
                prevMembers.map(m => {
                    if (m._id === memberId) {
                        const currentAccess = m.access || initialAccessToggles;
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
    }, [showNotification, editingId]); // Added editingId to dependencies for local state check

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsApiLoading(true);

        if (!username.trim() || (!editingId && !password.trim())) {
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
            setAccessToggles(initialAccessToggles);
            await fetchMembers();
            await fetchStorageData(); 
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
            await fetchStorageData(); 
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
        setPassword(""); // Clear password field on edit for security/UX
        setAccessToggles(member.access || initialAccessToggles);
        showNotification(`Editing "${member.username}"...`, "info");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setUsername("");
        setPassword("");
        setAccessToggles(initialAccessToggles);
        showNotification("Edit cancelled.", "info");
    };

    const handleClearForm = () => {
        setUsername("");
        setPassword("");
        setEditingId(null);
        setAccessToggles(initialAccessToggles);
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

    // --- Derived State (useMemo) ---
    const filteredMembers = useMemo(() => {
        return members.filter((member) =>
            member.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [members, searchTerm]);

    const memberStats = useMemo(() => {
        const totalMembers = members.length;
        
        const formatSecondsToMinutes = (seconds: number) => seconds / 60;
        
        const totalUsageSeconds = memberUsageData.reduce((sum, usage) => sum + usage.seconds, 0);

        const memberUsageChartData = members.map(member => {
            const usageEntry = memberUsageData.find(u => u.userId === member._id);
            const seconds = usageEntry?.seconds || 0;
            return {
                name: member.username,
                usage: formatSecondsToMinutes(seconds), // usage in MINUTES
                seconds: seconds
            };
        }).sort((a, b) => b.usage - a.usage); 

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
            totalUsageMinutes: formatSecondsToMinutes(totalUsageSeconds).toFixed(1),
            memberUsageChartData,
            accessDistribution 
        };
    }, [members, memberUsageData]);

    const storageUsagePercentage = useMemo(() => {
        if (!storageUsedData) return 0;
        if (storageUsedData.totalStorageMB === 0) return 0;

        const percentage = (storageUsedData.usedStorageMB / storageUsedData.totalStorageMB) * 100;
        return Math.max(0, Math.min(100, percentage)); 
    }, [storageUsedData]);

    // --- Initial Load Effect ---
    useEffect(() => {
        const checkAuthenticationAndLoad = async () => {
            const authed = await isAuthenticated();
            if (!authed) {
                router.push('/login');
                showNotification("You need to log in to access this page.", "error");
            } else {
                await Promise.allSettled([
                    fetchMembers(),
                    fetchStorageData(), 
                    fetchBugReports(), 
                ]);
            }
            setIsPageLoading(false);
        };

        checkAuthenticationAndLoad();
    }, [router, fetchMembers, fetchStorageData, fetchBugReports, showNotification]);

    return {
        // State
        members, username, password, editingId, notification, searchTerm, showPassword,
        isApiLoading, isPageLoading, visiblePasswordId, accessToggles, isConfirmingDelete,
        bugReports, memberUsageData, storageUsedData,

        // Setters
        setUsername, setPassword, setSearchTerm, setShowPassword, setVisiblePasswordId,
        setAccessToggles, setIsConfirmingDelete,

        // Computed
        filteredMembers, memberStats, storageUsagePercentage,

        // Actions
        showNotification, refreshAllData, handleAccessToggle, handleSubmit, handleDelete,
        handleEdit, handleCancelEdit, handleClearForm, handleLogout,
        handleResolveReport,
    };
};