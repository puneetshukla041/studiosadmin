// This is the fully fixed code for ./app/dashboard/page.tsx
'use client';

import React, { useCallback, useMemo } from "react";
import { IconType } from "react-icons";
import {
  FiUsers,
  FiLogOut,
  FiEdit3,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiCheck,
  FiInfo,
  FiAlertCircle,
  FiBell,
  FiPlusCircle,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiRotateCcw,
  FiLoader,
  FiClock,
  FiImage,
  FiCamera,
  FiStar,
  FiFolder,
  FiGrid,
  FiUserPlus,
  FiActivity,
  FiSettings,
  FiBarChart2,
  FiTrendingUp,
  FiCheckCircle,
  FiRefreshCw,
  FiLock,
  FiZap, // Added for a modern feel
} from "react-icons/fi";

import BugReportListCard from '@/components/dashboard/BugReportListCard';
import MockChart from "@/components/dashboard/MockChart";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickMetrics from "@/components/dashboard/QuickMetrics";
import UserTable from "@/components/dashboard/UserTable";
import { useMemberData } from "@/hooks/useMemberData";

// --- ACCESS TOGGLE CONFIG ---
interface AccessTogglesState {
  posterEditor: boolean;
  certificateEditor: boolean;
  visitingCard: boolean;
  idCard: boolean;
  bgRemover: boolean;
  imageEnhancer: boolean;
  assets: boolean;
}

interface AccessItem {
  key: keyof AccessTogglesState;
  label: string;
  icon: IconType;
  description: string;
}

const accessItems: AccessItem[] = [
  { key: 'posterEditor', label: 'Poster Editor', icon: FiImage, description: 'Design & marketing tools' },
  { key: 'certificateEditor', label: 'Certificate Editor', icon: FiCheckCircle, description: 'Official document generation' },
  { key: 'visitingCard', label: 'Visiting Card', icon: FiUserPlus, description: 'Professional contact management' },
  { key: 'idCard', label: 'ID Card Generator', icon: FiCamera, description: 'Employee identification badges' },
  { key: 'bgRemover', label: 'Background Remover', icon: FiFolder, description: 'AI image background removal' },
  { key: 'imageEnhancer', label: 'Image Enhancer', icon: FiStar, description: 'Upscaling & quality improvement' },
  // 'assets' intentionally omitted from tiles
];

// --- MAIN COMPONENT ---
export default function MembersPage() {
  const {
    // State
    members,
    username,
    password,
    editingId,
    notification,
    searchTerm,
    showPassword,
    isApiLoading,
    isPageLoading,
    visiblePasswordId,
    accessToggles,
    isConfirmingDelete,
    bugReports,
    storageUsedData,

    // Setters
    setUsername,
    setPassword,
    setSearchTerm,
    setShowPassword,
    setVisiblePasswordId,
    setIsConfirmingDelete,

    // Computed
    filteredMembers,
    memberStats,
    storageUsagePercentage,

    // Actions
    refreshAllData,
    handleAccessToggle, // (field, value, memberId) - Hook signature
    handleSubmit: hookHandleSubmit, // Rename to avoid conflict in useCallback dependency
    handleDelete,
    handleEdit,
    handleCancelEdit,
    handleClearForm,
    handleLogout,
    handleResolveReport: hookHandleResolveReport,
  } = useMemberData();

  const handleResolveReport = hookHandleResolveReport;

  // 🟢 FIX: Adapter function to satisfy UserTable's expected signature: (memberId, field, value)
  // The table passes: (memberId, field, value)
  // The hook expects: (field, value, memberId)
  const handleAccessToggleForTable = useCallback(
    (
      memberId: string, 
      field: keyof AccessTogglesState, 
      value: boolean
    ) => {
      // Call the hook function with the arguments reordered to match its definition
      // We know memberId from the table is always a string here, so it's safe.
      return handleAccessToggle(field, value, memberId);
    },
    [handleAccessToggle] // Dependency on the original hook function
  );

  // Helper: is any access enabled (excluding 'assets')
  const isAnyAccessEnabled = useMemo(() => {
    if (!accessToggles) return false;
    return Object.keys(accessToggles).some(k => k !== 'assets' && !!accessToggles[k as keyof AccessTogglesState]);
  }, [accessToggles]);

  /**
   * FIX: Corrected handleSubmit call to satisfy the hook's required argument (React.FormEvent).
   */
  const onSubmit = useCallback((e: React.FormEvent) => {
    // Prevent the default form submission to avoid page reload
    if (e && e.preventDefault) e.preventDefault();
    
    // Call the original handleSubmit from the hook, passing the event to satisfy the expected argument.
    hookHandleSubmit(e); 
  }, [hookHandleSubmit]); 


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

  return (
    <div className="min-h-screen w-full font-sans antialiased bg-gray-50 text-gray-800 p-4 sm:p-6 md:p-8 lg:p-10">
      {/* API Loading Overlay - Enhanced UI */}
      {isApiLoading && (
        <div className="fixed inset-0 bg-gray-900/15 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="text-center text-gray-700 bg-white p-6 rounded-xl shadow-2xl border-t-4 border-indigo-600">
            <FiZap className="w-8 h-8 animate-pulse mx-auto text-indigo-600 mb-2" />
            <p className="text-base font-bold tracking-tight text-gray-900">Processing Request...</p>
            <p className="text-xs text-gray-500 mt-1">Please wait a moment.</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Enhanced UI */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-red-600 text-center max-w-sm w-full transform scale-100 transition-all duration-300">
            <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4 p-1 bg-red-50 rounded-full" />
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this member? This action cannot be reversed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsConfirmingDelete(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(isConfirmingDelete)}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-bold text-sm shadow-md shadow-red-500/30"
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-full mx-auto">
        {/* Notification/Toast - Enhanced UI */}
        {notification && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 bg-white border border-gray-100 text-base font-semibold whitespace-nowrap overflow-hidden w-max min-w-[36px] max-w-md transform transition-all duration-500 ${notification.active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}
            role="status"
            aria-live="polite"
          >
            <div className={`flex-shrink-0 text-xl ${notification.type === "success" ? "text-green-600" : ""} ${notification.type === "info" ? "text-indigo-600" : ""} ${notification.type === "error" ? "text-red-600" : ""}`}>
              {notification.type === "success" && <FiCheckCircle className="w-5 h-5" />}
              {notification.type === "info" && <FiInfo className="w-5 h-5" />}
              {notification.type === "error" && <FiAlertCircle className="w-5 h-5" />}
            </div>
            <span className="flex-grow text-center text-gray-700">
              {notification.message}
            </span>
          </div>
        )}

        {/* Header */}
        <DashboardHeader
          isApiLoading={isApiLoading}
          refreshAllData={refreshAllData}
          handleLogout={handleLogout}
        />

        {/* Analytics & Graphs */}
        <section className="mb-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <QuickMetrics
            memberStats={memberStats}
            storageUsedData={storageUsedData}
            storageUsagePercentage={storageUsagePercentage}
          />

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <BugReportListCard
              reports={bugReports}
              onResolveReport={handleResolveReport}
            />

            <MockChart
              title="Module Access Distribution"
              type="Bar"
              data={memberStats?.accessDistribution}
              color="green"
              dataType="distribution"
            />
          </div>
        </section>

        <hr className="my-10 border-gray-200" />

        {/* Member Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column - Enhanced UI */}
          <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100 h-fit transition-all duration-300 hover:shadow-indigo-300/40">
            <header className="mb-8 border-b pb-4 border-gray-100">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <FiUserPlus className="w-7 h-7 text-indigo-600" /> {editingId ? 'Modify Member Access' : 'Provision New Account'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Setup secure credentials and define permissions for your team.</p>
            </header>

            {/* Use the fixed onSubmit */}
            <form onSubmit={onSubmit} className="space-y-8">
              {/* Credentials */}
              <div className="space-y-5 p-5 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                  <FiLock className="w-4 h-4 text-indigo-500" /> ACCOUNT SECURITY
                </h3>

                <div>
                  <label htmlFor="username" className="text-sm font-semibold text-gray-700 mb-1 block">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Unique Employee ID or Username"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm text-sm disabled:bg-gray-200 disabled:text-gray-500"
                    required
                    disabled={isApiLoading || editingId !== null} // Typically disable username edit
                  />
                  {editingId !== null && <p className="text-xs text-gray-400 mt-1">Username is fixed when editing.</p>}
                </div>

                <div>
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password || ''}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingId ? "Leave blank to keep current" : "Minimum 8 characters"}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm text-sm disabled:bg-gray-200 disabled:text-gray-500"
                      required={!editingId}
                      disabled={isApiLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition p-1"
                      disabled={isApiLoading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Access toggles - Enhanced UI */}
              <div className="space-y-5 pt-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <FiGrid className="w-4 h-4 text-indigo-500" /> MODULE PERMISSIONS
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {accessItems.map((item) => {
                    const Icon = item.icon;
                    const isChecked = !!accessToggles?.[item.key];

                    return (
                      <div
                        key={item.key}
                        role="switch"
                        tabIndex={0}
                        aria-checked={isChecked}
                        // The hook expects: (field, value, editingId)
                        onClick={() => handleAccessToggle(item.key, !isChecked, editingId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleAccessToggle(item.key, !isChecked, editingId);
                          }
                        }}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200/50
                          ${isChecked ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-200/50' : 'bg-white border-gray-200 hover:border-gray-400 shadow-md hover:shadow-lg'}
                          ${isApiLoading ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                        aria-disabled={isApiLoading}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isChecked ? 'text-indigo-600' : 'text-gray-500'}`} />
                            <span className={`text-sm font-bold ${isChecked ? 'text-indigo-900' : 'text-gray-800'}`}>
                              {item.label}
                            </span>
                          </div>

                          <div className={`relative w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${isChecked ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${isChecked ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-2 pl-0 pt-2 border-t border-dashed border-gray-100">{item.description}</p>
                      </div>
                    );
                  })}
                </div>

                {!isAnyAccessEnabled && (
                  <p className="text-sm text-red-700 pt-2 flex items-start gap-2 font-medium bg-red-100 p-3 rounded-xl border border-red-300">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span className="font-bold">Warning:</span> User has no core module access. Please enable at least one permission.
                  </p>
                )}
              </div>

              {/* Actions - Enhanced UI */}
              <div className="pt-6 space-y-4 border-t border-gray-100">
                <button
                  type="submit"
                  className={`w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl text-white font-extrabold text-lg transition-all duration-200 shadow-xl
                    ${isApiLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-500/50'}
                    ${(!editingId && (!username || !password)) ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                  disabled={isApiLoading || (!editingId && (!username || !password))}
                >
                  {isApiLoading ? (
                    <><FiLoader className="w-5 h-5 animate-spin" /> {editingId ? 'UPDATING...' : 'PROVISIONING...'}</>
                  ) : (
                    <><FiSave className="w-5 h-5" /> {editingId ? 'Save Changes' : 'Create Account'}</>
                  )}
                </button>

                {editingId ? (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2.5 text-sm rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-semibold active:scale-[0.99] border border-gray-200"
                    disabled={isApiLoading}
                  >
                    <FiXCircle className="w-4 h-4" /> Discard Changes
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2.5 text-sm rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-semibold active:scale-[0.99] border border-gray-200"
                    disabled={isApiLoading}
                  >
                    <FiRotateCcw className="w-4 h-4" /> Reset Form
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Column */}
          <div className="lg:col-span-2">
            <UserTable
              filteredMembers={filteredMembers}
              searchTerm={searchTerm}
              editingId={editingId}
              isApiLoading={isApiLoading}
              visiblePasswordId={visiblePasswordId}
              setSearchTerm={setSearchTerm}
              setVisiblePasswordId={setVisiblePasswordId}
              // 🟢 FIXED: Pass the adapter function that matches UserTable's expected signature (memberId, field, value)
              handleAccessToggle={handleAccessToggleForTable} 
              handleEdit={handleEdit}
              setIsConfirmingDelete={setIsConfirmingDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}