// BugReportListCard.tsx

import React, { useMemo, useState, useCallback } from 'react';
import { 
    FiStar, FiAlertTriangle, FiX, FiCheckCircle, FiSend, FiMessageSquare, FiUser 
} from "react-icons/fi"; 

// --- INTERFACE DEFINITION ---
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
// ----------------------------

interface BugReportListCardProps {
    reports: BugReport[];
    // This is implemented in the parent component to call the API
    onResolveReport: (reportId: string, resolutionMessage: string) => Promise<void>; 
}

const BugReportListCard: React.FC<BugReportListCardProps> = ({ reports, onResolveReport }) => {
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [resolutionMessage, setResolutionMessage] = useState('');
    const [isResolving, setIsResolving] = useState(false);

    const selectedReport = useMemo(() => reports.find(r => r._id === selectedReportId), [reports, selectedReportId]);
    
    const sortedReports = useMemo(() => {
        const statusOrder: { [key: string]: number } = { "Open": 1, "In Progress": 2, "Resolved": 3, "Closed": 4 };
        return [...reports].sort((a, b) => {
            const statusA = statusOrder[a.status] || 5;
            const statusB = statusOrder[b.status] || 5;
            if (statusA !== statusB) {
                return statusA - statusB;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [reports]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Open": return "bg-red-100 text-red-700 border-red-300";
            case "In Progress": return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "Resolved": return "bg-green-100 text-green-700 border-green-300";
            case "Closed": return "bg-gray-100 text-gray-500 border-gray-300";
            default: return "bg-gray-100 text-gray-500 border-gray-300";
        }
    };

    const getRatingStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FiStar key={i} className={`w-3 h-3 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
            );
        }
        return <div className="flex items-center space-x-0.5">{stars}</div>;
    };

    const closeModal = useCallback(() => {
        setSelectedReportId(null);
        setResolutionMessage('');
    }, []);

    // Function that calls the prop provided by the parent
    const handleResolve = useCallback(async () => {
        if (!selectedReport || resolutionMessage.trim().length === 0) return;

        setIsResolving(true);
        try {
            await onResolveReport(selectedReport._id, resolutionMessage);
            closeModal();
        } catch (error) {
            console.error("Error resolving bug report:", error);
            // Re-throw or handle error display here
        } finally {
            setIsResolving(false);
        }
    }, [selectedReport, resolutionMessage, onResolveReport, closeModal]);


    const BugReportDetailModal = () => {
        if (!selectedReport) return null;
        
        const isResolvedOrClosed = selectedReport.status === 'Resolved' || selectedReport.status === 'Closed';
        
        return (
            <div className={`fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300`}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
                    {/* Modal Header */}
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FiAlertTriangle className="text-2xl text-red-600" /> Bug Report: <span className='truncate max-w-[300px]'>{selectedReport.title}</span>
                        </h3>
                        <button onClick={closeModal} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Report Details */}
                        <div className="space-y-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-200">
                            <div className="flex justify-between items-center text-sm">
                                <p className="font-medium text-gray-700 flex items-center gap-2">
                                    <FiUser className="w-4 h-4 text-indigo-500"/> Reported By: <span className="text-indigo-700 font-semibold">{selectedReport.username}</span>
                                </p>
                                {getRatingStars(selectedReport.rating)}
                            </div>
                            <div className='flex items-center justify-between'>
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                    Reported On: {new Date(selectedReport.createdAt).toLocaleString()}
                                </p>
                                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border shadow-sm ${getStatusStyle(selectedReport.status)}`}>
                                    {selectedReport.status}
                                </span>
                            </div>
                            
                            <p className="text-sm text-gray-800 font-medium pt-2 border-t border-indigo-200">Description:</p>
                            <div className="p-3 bg-white rounded-md border border-gray-300 text-sm text-gray-700 whitespace-pre-wrap shadow-inner max-h-40 overflow-y-auto">
                                {selectedReport.description}
                            </div>
                        </div>

                        {/* Resolution Area - Display existing resolution if available, otherwise show input */}
                        {isResolvedOrClosed ? (
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-1 text-green-700">
                                    <FiCheckCircle className="w-4 h-4"/> Resolution Sent to User
                                </h4>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-300 text-sm text-gray-700 whitespace-pre-wrap shadow-inner">
                                    {selectedReport.resolutionMessage || "Resolution message was not saved or is unavailable."}
                                </div>
                            </div>
                        ) : (
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                    <FiMessageSquare className="w-4 h-4 text-indigo-500"/> Resolution Message (Required to Close Ticket)
                                </h4>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm focus:shadow-md"
                                    rows={5} 
                                    placeholder={`Explain how the bug (${selectedReport.title}) was resolved. This message will be saved and sent to the user ${selectedReport.username} upon closing the ticket.`}
                                    value={resolutionMessage}
                                    onChange={(e) => setResolutionMessage(e.target.value)}
                                    disabled={isResolving}
                                    required
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Modal Footer (Actions) */}
                    <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                        <button 
                            onClick={closeModal} 
                            disabled={isResolving}
                            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            {isResolvedOrClosed ? 'Close View' : 'Cancel'}
                        </button>
                        {!isResolvedOrClosed && (
                            <button 
                                onClick={handleResolve} 
                                disabled={isResolving || resolutionMessage.trim().length === 0}
                                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isResolving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>
                                ) : (
                                    <><FiSend className="w-4 h-4" /> Close Ticket & Save Resolution</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-lg h-full">
            <p className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2 border-gray-100">
                <FiAlertTriangle className="text-xl text-red-600" /> Recent Bug Reports ({reports.length})
            </p>
            <div className="space-y-2 pr-2">
                {reports.length > 0 ? (
                    sortedReports.map((report) => (
                        <div 
                            key={report._id} 
                            onClick={() => setSelectedReportId(report._id)}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-150 cursor-pointer active:scale-[.99] transform focus:ring-2 focus:ring-indigo-400"
                            tabIndex={0}
                        >
                            {/* --- LINE 1: Title and Status (Flex row) --- */}
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-gray-900 truncate mr-2 flex-1 min-w-0">
                                    {report.title}
                                </span>
                                <span className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap shadow-xs ${getStatusStyle(report.status)}`}>
                                    {report.status}
                                </span>
                            </div>

                            {/* --- LINE 2: Reporter and Rating (Flex row) --- */}
                            <div className="flex justify-between items-center text-xs text-gray-600">
                                <p className="flex items-center gap-1">
                                    <FiUser className="w-3 h-3 text-gray-400"/>
                                    <span className="font-medium text-[11px]">{report.username || 'N/A'}</span> 
                                    <span className="text-gray-400 text-[10px] ml-1">({new Date(report.createdAt).toLocaleDateString()})</span>
                                </p>
                                {getRatingStars(report.rating)}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 italic mt-8 text-sm">No bug reports available. Check API connection.</p>
                )}
            </div>
            {/* Render Modal if a report is selected */}
            {selectedReportId && <BugReportDetailModal />}
        </div>
    );
};

export default BugReportListCard;