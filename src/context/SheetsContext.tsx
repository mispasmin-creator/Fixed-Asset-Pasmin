import { fetchSheet } from '@/lib/fetchers';
import type {
    IndentSheet,
    InventorySheet,
    MasterSheet,
    PoMasterSheet,
    ReceivedSheet,
    StoreInSheet,
    IssueSheet,
    TallyEntrySheet,
    PcReportSheet,
    FullkittingSheet,
    PaymentHistory,
    PIApprovalSheet,  // ✅ CORRECT
} from '@/types';

import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SheetsState {
    // Update functions
    updateReceivedSheet: () => void;
    updatePoMasterSheet: () => void;
    updateIndentSheet: () => void;
    updateAll: () => void;
    updateIssueSheet: () => void;
    updateStoreInSheet: () => void;
    updateTallyEntrySheet: () => void;
    updatePcReportSheet: () => void;
    updateFullkittingSheet: () => void;
    updatePaymentHistorySheet: () => void;
    updatePIApprovalSheet: () => void;  // ✅ CORRECT

    updateSheet: (sheetName: string, rowIndex: number, updateData: any) => Promise<any>; // ✅ ADD THIS LINE

    sheets: StoreInSheet[];
    indentSheet: IndentSheet[];
    storeInSheet: StoreInSheet[];
    poMasterSheet: PoMasterSheet[];
    receivedSheet: ReceivedSheet[];
    inventorySheet: InventorySheet[];
    pcReportSheet: PcReportSheet[];
    masterSheet: MasterSheet | undefined;
    issueSheet: IssueSheet[];
    tallyEntrySheet: TallyEntrySheet[];
    fullkittingSheet: FullkittingSheet[];
    paymentHistorySheet: PaymentHistory[];
    piApprovalSheet: PIApprovalSheet[];  // ✅ CORRECT

    // Loading states
    indentLoading: boolean;
    poMasterLoading: boolean;
    receivedLoading: boolean;
    inventoryLoading: boolean;
    allLoading: boolean;
    issueLoading: boolean;
    storeInLoading: boolean;
    tallyEntryLoading: boolean;
    fullkittingLoading: boolean;
    paymentHistoryLoading: boolean;
    piApprovalLoading: boolean;  // ✅ CORRECT
}

const SheetsContext = createContext<SheetsState | null>(null);

export const SheetsProvider = ({ children }: { children: React.ReactNode }) => {
    // All sheet states
    const [indentSheet, setIndentSheet] = useState<IndentSheet[]>([]);
    const [storeSheet, setStoreInSheet] = useState<StoreInSheet[]>([]);
    const [receivedSheet, setReceivedSheet] = useState<ReceivedSheet[]>([]);
    const [poMasterSheet, setPoMasterSheet] = useState<PoMasterSheet[]>([]);
    const [inventorySheet, setInventorySheet] = useState<InventorySheet[]>([]);
    const [masterSheet, setMasterSheet] = useState<MasterSheet>();
    const [tallyEntrySheet, setTallyEntrySheet] = useState<TallyEntrySheet[]>([]);
    const [pcReportSheet, setPcReportSheet] = useState<PcReportSheet[]>([]);
    const [fullkittingSheet, setFullkittingSheet] = useState<FullkittingSheet[]>([]);
    const [issueSheet, setIssueSheet] = useState<IssueSheet[]>([]);
    const [paymentHistorySheet, setPaymentHistorySheet] = useState<PaymentHistory[]>([]);
    const [piApprovalSheet, setPIApprovalSheet] = useState<PIApprovalSheet[]>([]);  // ✅ CORRECT

    // All loading states
    const [indentLoading, setIndentLoading] = useState(true);
    const [poMasterLoading, setPoMasterLoading] = useState(true);
    const [receivedLoading, setReceivedLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [allLoading, setAllLoading] = useState(true);
    const [storeInLoading, setStoreInLoading] = useState(true);
    const [tallyEntryLoading, setTallyEntryLoading] = useState(true);
    const [fullkittingLoading, setFullkittingLoading] = useState(true);
    const [issueLoading, setIssueLoading] = useState(true);
    const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(true);
    const [piApprovalLoading, setPIApprovalLoading] = useState(true);  // ✅ CORRECT

    const sheets = storeSheet;

    // Update functions
    function updatePIApprovalSheet() {  // ✅ CORRECT
        setPIApprovalLoading(true);
        fetchSheet('PI APPROVAL')
            .then((res) => {
        setPIApprovalSheet(res as unknown as PIApprovalSheet[]);  // ✅ FIXED
                setPIApprovalLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching PI APPROVAL:', error);
                setPIApprovalLoading(false);
            });
    }

    function updateStoreInSheet() {
        setStoreInLoading(true);
        fetchSheet('STORE IN')
            .then((res) => {
                setStoreInSheet(res as StoreInSheet[]);
                setStoreInLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching STORE IN:', error);
                setStoreInLoading(false);
            });
    }

    function updateIssueSheet() {
        setIssueLoading(true);
        fetchSheet('ISSUE').then((res) => {
            setIssueSheet(res as unknown as IssueSheet[]);
            setIssueLoading(false);
        });
    }

    function updateIndentSheet() {
        setIndentLoading(true);
        fetchSheet('INDENT').then((res) => {
            setIndentSheet(res as IndentSheet[]);
            setIndentLoading(false);
        });
    }

    function updateReceivedSheet() {
        setReceivedLoading(true);
        fetchSheet('RECEIVED').then((res) => {
            setReceivedSheet(res as ReceivedSheet[]);
            setReceivedLoading(false);
        });
    }

    function updatePoMasterSheet() {
        setPoMasterLoading(true);
        fetchSheet('PO MASTER').then((res) => {
            setPoMasterSheet(res as PoMasterSheet[]);
            setPoMasterLoading(false);
        });
    }

    function updateInventorySheet() {
        setInventoryLoading(true);
        fetchSheet('INVENTORY').then((res) => {
            setInventorySheet(res as InventorySheet[]);
            setInventoryLoading(false);
        });
    }

    function updateMasterSheet() {
        fetchSheet('MASTER').then((res) => {
            setMasterSheet(res as MasterSheet);
        });
    }

    function updateFullkittingSheet() {
        setFullkittingLoading(true);
        fetchSheet('Fullkitting')
            .then((res) => {
                setFullkittingSheet(res as unknown as FullkittingSheet[]);
                setFullkittingLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching Fullkitting:', error);
                setFullkittingLoading(false);
            });
    }

    function updatePaymentHistorySheet() {
        setPaymentHistoryLoading(true);
        fetchSheet('Payment History')
            .then((res) => {
                setPaymentHistorySheet(res as PaymentHistory[]);
                setPaymentHistoryLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching PAYMENT HISTORY:', error);
                setPaymentHistoryLoading(false);
            });
    }

    function updateTallyEntrySheet() {
        setTallyEntryLoading(true);
        fetchSheet('TALLY ENTRY')
            .then((res) => {
                setTallyEntrySheet(res as TallyEntrySheet[]);
                setTallyEntryLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching TALLY ENTRY:', error);
                setTallyEntryLoading(false);
            });
    }

    function updatePcReportSheet() {
        fetchSheet('PC REPORT')
            .then((res) => setPcReportSheet(res as PcReportSheet[]))
            .catch((err) => console.error('Error fetching PC REPORT:', err));
    }

    // Add this new function after updatePcReportSheet()
async function updateSheet(sheetName: string, rowIndex: number, updateData: any) {
    try {
        console.log('🔄 updateSheet called:', { sheetName, rowIndex, updateData });
        
        const scriptUrl = import.meta.env.VITE_APP_SCRIPT_URL;
        
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('sheetName', sheetName);
        formData.append('rows', JSON.stringify([{ ...updateData, rowIndex }]));
        
        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: formData,
        });
        
        const result = await response.json();
        console.log('📨 Update result:', result);
        
        if (result.success) {
            // Refresh the PI Approval sheet after successful update
            updatePIApprovalSheet();
            toast.success('PI APPROVAL sheet updated successfully');
        } else {
            toast.error(result.error || 'Failed to update sheet');
        }
        
        return result;
    } catch (error: any) {
        console.error('❌ Error in updateSheet:', error);
        toast.error('Network error while updating sheet');
        return { success: false, error: error.message };
    }
}
    function updateAll() {
        setAllLoading(true);
        updateMasterSheet();
        updateReceivedSheet();
        updateIndentSheet();
        updatePoMasterSheet();
        updateInventorySheet();
        updateStoreInSheet();
        updateIssueSheet();
        updateTallyEntrySheet();
        updatePcReportSheet();
        updateFullkittingSheet();
        updatePaymentHistorySheet();
        updatePIApprovalSheet();  // ✅ CORRECT
        setAllLoading(false);
    }

    useEffect(() => {
        try {
            updateAll();
            toast.success('Fetched all the data');
        } catch (e) {
            toast.error('Something went wrong while fetching data');
        }
    }, []);

    return (
        <SheetsContext.Provider
            value={{
                // Update functions
                updateIndentSheet,
                updatePoMasterSheet,
                updateReceivedSheet,
                updateAll,
                updateIssueSheet,
                updateStoreInSheet,
                updateTallyEntrySheet,
                updatePcReportSheet,
                updateFullkittingSheet,
                updatePaymentHistorySheet,
                updatePIApprovalSheet,  // ✅ CORRECT
                 updateSheet, // ✅ ADD THIS LINE

                // Sheet data
                sheets,
                indentSheet,
                poMasterSheet,
                inventorySheet,
                receivedSheet,
                masterSheet,
                storeInSheet: storeSheet,
                issueSheet,
                tallyEntrySheet,
                pcReportSheet,
                fullkittingSheet,
                paymentHistorySheet,
                piApprovalSheet,  // ✅ CORRECT

                // Loading states
                indentLoading,
                poMasterLoading,
                receivedLoading,
                inventoryLoading,
                allLoading,
                issueLoading,
                storeInLoading,
                tallyEntryLoading,
                fullkittingLoading,
                paymentHistoryLoading,
                piApprovalLoading,  // ✅ CORRECT
            }}
        >
            {children}
        </SheetsContext.Provider>
    );
};

export const useSheets = () => useContext(SheetsContext)!;
