import { Package2, FileText, Building, User, UserCheck, IndianRupee } from 'lucide-react';
import Heading from '../element/Heading';
import { useSheets } from '@/context/SheetsContext';
import { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from '../element/DataTable';
import { Pill } from '../ui/pill';
import { useAuth } from '@/context/AuthContext';

interface HistoryData {
    poNumber: string;
    poCopy: string;
    vendorName: string;
    preparedBy: string;
    approvedBy: string;
    totalAmount: number;
    status: 'Revised' | 'Not Received' | 'Received' | 'Unknown';
}

interface POMasterRecord {
    approvedBy?: string;
    pdf?: string;
    poNumber?: string;
    preparedBy?: string;
    totalPoAmount?: string | number;
    partyName?: string;
    firmNameMatch?: string;
}

interface IndentRecord {
    poNumber?: string;
}

interface ReceivedRecord {
    poNumber?: string;
}

export default function POHistory() {
    const { poMasterLoading, poMasterSheet, indentSheet, receivedSheet } = useSheets();
    const { user } = useAuth();
    const [historyData, setHistoryData] = useState<HistoryData[]>([]);

    useEffect(() => {
        try {
            // Safe array check
            const safePoMasterSheet: POMasterRecord[] = Array.isArray(poMasterSheet) ? poMasterSheet : [];
            
            // Filter by firm name
            const filteredByFirm = safePoMasterSheet.filter((sheet: POMasterRecord) => 
                user?.firmNameMatch?.toLowerCase() === "all" || 
                sheet?.firmNameMatch === user?.firmNameMatch
            );
            
            // Create a map to store unique PO numbers (latest entry for each PO number)
            const poNumberMap = new Map<string, POMasterRecord>();
            
            filteredByFirm.forEach((sheet: POMasterRecord) => {
                const poNumber = sheet?.poNumber;
                if (poNumber) {
                    // If PO number already exists, keep the existing entry
                    // (This ensures we only keep the first occurrence, which is usually the latest/most complete)
                    if (!poNumberMap.has(poNumber)) {
                        poNumberMap.set(poNumber, sheet);
                    }
                }
            });
            
            // Convert map back to array
            const uniquePoMasterData = Array.from(poNumberMap.values());
            
            console.log(`📊 Original PO count: ${filteredByFirm.length}, Unique PO count: ${uniquePoMasterData.length}`);
            
            const processedHistoryData: HistoryData[] = uniquePoMasterData.map((sheet: POMasterRecord) => ({
                approvedBy: sheet?.approvedBy || '',
                poCopy: sheet?.pdf || '',
                poNumber: sheet?.poNumber || '',
                preparedBy: sheet?.preparedBy || '',
                totalAmount: Number(sheet?.totalPoAmount) || 0,
                vendorName: sheet?.partyName || '',
                
                // Safe status calculation
                status: (() => {
                    try {
                        const safeIndentSheet: IndentRecord[] = Array.isArray(indentSheet) ? indentSheet : [];
                        const safeReceivedSheet: ReceivedRecord[] = Array.isArray(receivedSheet) ? receivedSheet : [];
                        
                        const poNumber = sheet?.poNumber;
                        if (!poNumber) return 'Unknown';
                        
                        const isInIndentSheet = safeIndentSheet
                            .some((s: IndentRecord) => s?.poNumber === poNumber);
                            
                        const isInReceivedSheet = safeReceivedSheet
                            .some((r: ReceivedRecord) => r?.poNumber === poNumber);
                        
                        if (isInIndentSheet) {
                            return isInReceivedSheet ? 'Received' : 'Not Received';
                        }
                        return 'Revised';
                    } catch (error) {
                        console.warn('Error calculating status:', error);
                        return 'Unknown';
                    }
                })()
            }));
            
            // Sort by PO number (optional)
            processedHistoryData.sort((a, b) => {
                if (a.poNumber && b.poNumber) {
                    return a.poNumber.localeCompare(b.poNumber);
                }
                return 0;
            });
            
            setHistoryData(processedHistoryData);
            
        } catch (error) {
            console.error('❌ Error in useEffect:', error);
            setHistoryData([]);
        }
    }, [indentSheet, poMasterSheet, receivedSheet, user?.firmNameMatch]);

    // Creating table columns with enhanced styling
    const historyColumns: ColumnDef<HistoryData>[] = [
        { 
            accessorKey: 'poNumber', 
            header: 'PO Number',
            cell: ({ getValue }) => {
                const poNumber = getValue() as string;
                return (
                    <div className="font-bold text-blue-700">
                        {poNumber || '-'}
                    </div>
                );
            }
        },
        {
            accessorKey: 'poCopy',
            header: 'PO Copy',
            cell: ({ row }) => {
                const attachment = row.original.poCopy;
                return attachment ? (
                    <a 
                        href={attachment} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold underline flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                        <FileText className="h-4 w-4" />
                        View PDF
                    </a>
                ) : (
                    <span className="text-gray-400 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                        No PDF
                    </span>
                );
            },
        },
        { 
            accessorKey: 'vendorName', 
            header: 'Vendor Name',
            cell: ({ getValue }) => (
                <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <span className="truncate">{getValue() as string || '-'}</span>
                </div>
            )
        },
        // { 
        //     accessorKey: 'preparedBy', 
        //     header: 'Prepared By',
        //     cell: ({ getValue }) => (
        //         <div className="flex items-center gap-2">
        //             <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
        //             <span>{getValue() as string || '-'}</span>
        //         </div>
        //     )
        // },
        // { 
        //     accessorKey: 'approvedBy', 
        //     header: 'Approved By',
        //     cell: ({ getValue }) => (
        //         <div className="flex items-center gap-2">
        //             <UserCheck className="h-4 w-4 text-gray-600 flex-shrink-0" />
        //             <span>{getValue() as string || '-'}</span>
        //         </div>
        //     )
        // },
        {
            accessorKey: 'totalAmount',
            header: 'Amount',
            cell: ({ row }) => {
                const amount = row.original.totalAmount || 0;
                return (
                    <div className="font-bold text-green-700 flex items-center gap-1">
                        <IndianRupee className="h-4 w-4 flex-shrink-0" />
                        <span>{amount.toLocaleString('en-IN')}</span>
                    </div>
                );
            },
        },
        { 
            accessorKey: 'status', 
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const variant = 
                    status === "Not Received" ? "secondary" : 
                    status === "Received" ? "primary" : 
                    "default";
                
                return (
                    <Pill 
                        variant={variant} 
                        className="font-semibold text-sm px-3 py-2"
                    >
                        {status}
                    </Pill>
                );
            }
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 mb-6">
                    <Heading heading="PO History" subtext="View purchase orders and their status">
                        <Package2 size={50} className="text-blue-600" />
                    </Heading>

                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package2 className="h-5 w-5 text-blue-600" />
                                <div>
                                    <h3 className="font-semibold text-blue-800">Unique PO Numbers</h3>
                                    <p className="text-sm text-blue-600">
                                        Showing {historyData.length} unique purchase orders
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Duplicate PO numbers have been filtered
                            </div>
                        </div>
                    </div>

                    <DataTable
                        data={historyData}
                        columns={historyColumns}
                        searchFields={['vendorName', 'poNumber', 'preparedBy', 'approvedBy']}
                        dataLoading={poMasterLoading}
                        className='h-[80dvh] rounded-lg border-2 border-gray-200'
                    />
                </div>
            </div>
        </div>
    );
};