'use client'

import { FiUsers, FiLogOut, FiEdit3, FiTrash2, FiSave, FiXCircle, FiChevronRight,
    FiCheck, FiInfo, FiAlertCircle, FiBell, FiPlusCircle, FiSearch, FiEye,
    FiEyeOff, FiRotateCcw, FiLoader, FiClock, FiImage, FiCamera, FiStar,
    FiFolder, FiGrid, FiUserPlus, FiActivity, FiSettings, FiBarChart2, FiTrendingUp, FiCheckCircle,
    FiRefreshCw, // Refresh Icon
} from "react-icons/fi";
import { IconType } from "react-icons";
import BugReportListCard from './BugReportListCard'; // Assuming BugReportListCard is available or stubbed.
import MockChart from "./MockChart"; // Import the separated MockChart
import DashboardHeader from "./DashboardHeader"; // Import the separated Header
import QuickMetrics from "./QuickMetrics"; // Import the separated Metrics
import UserForm from "./UserForm"; // Import the separated Form
import UserTable from "./UserTable"; // Import the separated Table
import { useMemberData } from "@/hooks/useMemberData"; // Import the custom hook

// The rest of the interface definitions should ideally be imported from a shared file 
// but are removed here as they are now defined in useMemberData.ts for hook use.

// --- MAIN COMPONENT ---
export default function MembersPage() {
    const {
        // State
        members, username, password, editingId, notification, searchTerm, showPassword,
        isApiLoading, isPageLoading, visiblePasswordId, accessToggles, isConfirmingDelete,
        bugReports, storageUsedData,

        // Setters
        setUsername, setPassword, setSearchTerm, setShowPassword, setVisiblePasswordId,
        setAccessToggles, setIsConfirmingDelete,

        // Computed
        filteredMembers, memberStats, storageUsagePercentage,

        // Actions
        refreshAllData, handleAccessToggle, handleSubmit, handleDelete,
        handleEdit, handleCancelEdit, handleClearForm, handleLogout,
        // REMOVED: handleResolveReport was removed here because it's not exported by useMemberData().
        // It is defined locally below to satisfy BugReportListCard's required prop.
    } = useMemberData();

    // ACTION DEFINITION: Placeholder function to satisfy BugReportListCard prop.
    // NOTE: For proper modularity, this function's logic should be implemented
    // and returned by the useMemberData hook.
    const handleResolveReport = (reportId: string, resolutionMessage: string) => {
        console.log(`[ACTION PENDING HOOK UPDATE] Attempting to resolve report ${reportId} with message: "${resolutionMessage}"`);
        // In a real app, this would involve an async API call and a data refresh (e.g., fetchBugReports())
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
                // After successful API call, you would call refreshAllData()
            }, 500);
        });
    };


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

    // --- MAIN RENDER ---
    return (
        <div className="min-h-screen w-full font-sans antialiased bg-gray-50 text-gray-800 p-4 sm:p-6 md:p-8 lg:p-10">

            {/* API Loading Overlay (Remains here as it is a global UI element) */}
            {isApiLoading && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[60] flex items-center justify-center">
                    <div className="text-center text-gray-700">
                        <FiLoader className="w-16 h-16 animate-spin-slow mx-auto text-indigo-600 mb-4" />
                        <p className="text-lg font-semibold tracking-wide">Processing Request...</p>
                    </div>
                </div>
            )}

            {/* Confirmation Modal (Remains here as it is a global UI element) */}
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
                                onClick={() => handleDelete(isConfirmingDelete)}
                                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 w-full max-w-full mx-auto">
                {/* Notification/Toast (Remains here as it is a global UI element) */}
                {notification && (
                    <div
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 h-12 px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 bg-white border border-gray-200 text-base font-medium whitespace-nowrap overflow-hidden w-max min-w-[36px] md:max-w-[360px]`}
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
                <DashboardHeader
                    isApiLoading={isApiLoading}
                    refreshAllData={refreshAllData}
                    handleLogout={handleLogout}
                />
                
                {/* --- Analytics & Graphs Section --- */}
                <section className="mb-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Key Metrics */}
                    <QuickMetrics 
                        memberStats={memberStats} 
                        storageUsedData={storageUsedData} 
                        storageUsagePercentage={storageUsagePercentage}
                    />

                    {/* Graphs and Charts */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Bug Report List Card */}
                        <BugReportListCard 
                            reports={bugReports} 
                            // Pass the locally defined handler
                            onResolveReport={handleResolveReport} 
                        />

                        {/* Module Access Distribution Chart */}
                        <MockChart 
                            title="Module Access Distribution" 
                            type="Bar" 
                            data={memberStats.accessDistribution} 
                            color="green" 
                            dataType="distribution"
                        />
                    </div>
                </section>

                <hr className="my-10 border-gray-200"/>

                {/* --- Member Management Layout: Form & Table --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Column 1: Add/Edit Member Form */}
                    <UserForm 
                        username={username}
                        password={password}
                        editingId={editingId}
                        isApiLoading={isApiLoading}
                        showPassword={showPassword}
                        accessToggles={accessToggles}
                        setUsername={setUsername}
                        setPassword={setPassword}
                        setShowPassword={setShowPassword}
                        setAccessToggles={setAccessToggles}
                        handleSubmit={handleSubmit}
                        handleCancelEdit={handleCancelEdit}
                        handleClearForm={handleClearForm}
                    />
                    
                    {/* Column 2: Quick Access Guide */}
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
                <UserTable
                    filteredMembers={filteredMembers}
                    searchTerm={searchTerm}
                    editingId={editingId}
                    isApiLoading={isApiLoading}
                    visiblePasswordId={visiblePasswordId}
                    setSearchTerm={setSearchTerm}
                    setVisiblePasswordId={setVisiblePasswordId}
                    handleAccessToggle={handleAccessToggle}
                    handleEdit={handleEdit}
                    setIsConfirmingDelete={setIsConfirmingDelete}
                />
            </div>
        </div>
    );
}