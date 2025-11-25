import React, { useMemo, useState, useCallback } from 'react';
import { 
    FiStar, FiAlertTriangle, FiX, FiCheckCircle, FiSend, FiMessageSquare 
} from "react-icons/fi"; // Added new icons for modal

// --- INTERFACE DEFINITION (Needed in both files) ---
interface BugReport {
    _id: string;
    userId: string;
    title: string;
    username: string; 
    description: string;
    rating: number;
    status: string; // e.g., "Open", "In Progress", "Resolved", "Closed"
    createdAt: string; 
}
// ----------------------------------------------------

interface BugReportListCardProps {
    reports: BugReport[];
    // New prop: Function provided by the parent to handle API interaction for resolving a report
    onResolveReport: (reportId: string, resolutionMessage: string) => Promise<void>; 
}

const BugReportListCard: React.FC<BugReportListCardProps> = ({ reports, onResolveReport }) => {
    // State to manage the currently selected report for the detail modal
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    // State for the resolution message to be sent to the user
    const [resolutionMessage, setResolutionMessage] = useState('');
    // State for API loading during resolution
    const [isResolving, setIsResolving] = useState(false);

    // Find the currently selected report object
    const selectedReport = useMemo(() => reports.find(r => r._id === selectedReportId), [reports, selectedReportId]);
    
    // Sort reports: Open > In Progress > Resolved > Closed, then by newest
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
                <FiStar key={i} className={`w-3 h-3 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            );
        }
        return <div className="flex items-center space-x-0.5">{stars}</div>;
    };

    const closeModal = useCallback(() => {
        setSelectedReportId(null);
        setResolutionMessage('');
    }, []);

    // Function to handle the resolution action
    const handleResolve = useCallback(async () => {
        if (!selectedReport || resolutionMessage.trim().length === 0) return;

        setIsResolving(true);
        try {
            // Call the parent component's handler to update the database
            await onResolveReport(selectedReport._id, resolutionMessage);
            // Clear state and close modal only on success
            closeModal();
        } catch (error) {
            console.error("Error resolving bug report:", error);
            // In a real app, display a user-friendly error message.
        } finally {
            setIsResolving(false);
        }
    }, [selectedReport, resolutionMessage, onResolveReport, closeModal]);


    // The Modal Component for viewing and resolving the report
    const BugReportDetailModal = () => {
        if (!selectedReport) return null;
        
        const isResolvedOrClosed = selectedReport.status === 'Resolved' || selectedReport.status === 'Closed';
        
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
                    {/* Modal Header */}
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FiAlertTriangle className="text-red-600" /> Bug Report: {selectedReport.title}
                        </h3>
                        <button onClick={closeModal} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Report Details */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center text-sm">
                                <p className="font-medium text-gray-700">Reported By: <span className="text-indigo-600">{selectedReport.username}</span></p>
                                {getRatingStars(selectedReport.rating)}
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                Reported On: {new Date(selectedReport.createdAt).toLocaleString()}
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ml-2 ${getStatusStyle(selectedReport.status)}`}>
                                    {selectedReport.status}
                                </span>
                            </p>
                            <p className="text-sm text-gray-800 font-medium pt-2">Description:</p>
                            <div className="p-3 bg-white rounded-md border border-gray-300 text-sm text-gray-700 whitespace-pre-wrap">
                                {selectedReport.description}
                            </div>
                        </div>

                        {/* Resolution Area */}
                        {!isResolvedOrClosed && (
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                    <FiMessageSquare className="w-4 h-4 text-indigo-500"/> Resolution Message to User (Required to Close)
                                </h4>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={4}
                                    placeholder={`Explain how the bug (${selectedReport.title}) was resolved. This message will be sent to the user ${selectedReport.username} upon closing the ticket.`}
                                    value={resolutionMessage}
                                    onChange={(e) => setResolutionMessage(e.target.value)}
                                    disabled={isResolving}
                                    required
                                />
                            </div>
                        )}
                        
                        {isResolvedOrClosed && (
                            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-300 text-sm font-medium flex items-center gap-2">
                                <FiCheckCircle className="w-5 h-5"/> This report is already marked as <span className="font-bold">{selectedReport.status}</span>.
                            </div>
                        )}
                    </div>
                    
                    {/* Modal Footer (Actions) */}
                    <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                        <button 
                            onClick={closeModal} 
                            disabled={isResolving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                        >
                            {isResolvedOrClosed ? 'Close View' : 'Cancel'}
                        </button>
                        {!isResolvedOrClosed && (
                            <button 
                                onClick={handleResolve} 
                                // Disable if resolving or message is empty
                                disabled={isResolving || resolutionMessage.trim().length === 0}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-1"
                            >
                                {isResolving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>
                                ) : (
                                    <><FiSend className="w-4 h-4" /> Close Ticket & Notify User</>
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
                <FiAlertTriangle className="text-red-600" /> Recent Bug Reports ({reports.length})
            </p>
            <div className="space-y-2 pr-2">
                {reports.length > 0 ? (
                    sortedReports.map((report) => (
                        <div 
                            key={report._id} 
                            // Open the modal on click
                            onClick={() => setSelectedReportId(report._id)}
                            className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors cursor-pointer active:scale-[.99] transform"
                        >
                            <div className="flex justify-between items-start mb-0.5">
                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[80%]">{report.title}</span>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusStyle(report.status)}`}>
                                    {report.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                                <p className="flex items-center gap-1">
                                    <span className="font-medium text-[11px]">{report.username || 'N/A'}</span> 
                                    <span className="text-gray-400 text-[10px]">({new Date(report.createdAt).toLocaleDateString()})</span>
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