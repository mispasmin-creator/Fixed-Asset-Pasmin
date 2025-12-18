import type { IndentSheet, MasterSheet, ReceivedSheet, Sheet, StoreInSheet } from '@/types';
import type { 
    InventorySheet, 
    IssueSheet, 
    PoMasterSheet, 
    TallyEntrySheet, 
    UserPermissions, 
    Vendor, 
    PcReportSheet,
    PIApprovalSheet  // ✅ ONLY CHANGE: Added this import
} from '@/types/sheets';


// Add PaymentHistoryData interface
export interface PaymentHistoryData {
  timestamp: string;
  apPaymentNumber:string |number;
  status: string;
  uniqueNumber: string;
  fmsName: string;
  payTo: string;
  amountToBePaid:string |number;
  remarks: string;
  anyAttachments: string;
}


export async function uploadFile({
    file,
    folderId,
    uploadType = 'upload',
    email,
    emailSubject,
    emailBody
}: {
    file: File;
    folderId: string;
    uploadType?: 'upload' | 'email';
    email?: string;
    emailSubject?: string;
    emailBody?: string;
}): Promise<string> {
    const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
        const base64String = String(reader.result).split(',')[1] || '';
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const form = new FormData();
    form.append('action', 'upload');
    form.append('fileName', file.name);
    form.append('mimeType', file.type);
    form.append('fileData', base64);
    form.append('folderId', folderId);
    form.append('uploadType', uploadType);
    
    // Only add email fields if uploadType is 'email' AND email exists
    if (uploadType === "email" && email) {
        form.append('email', email);
        form.append('emailSubject', emailSubject || 'Purchase Order');
        form.append('emailBody', emailBody || 'Please find attached PO.');
    }

    const response = await fetch(import.meta.env.VITE_APP_SCRIPT_URL, {
        method: 'POST',
        body: form,
        redirect: 'follow',
    });

    console.log(response)
    if (!response.ok) throw new Error('Failed to upload file');
    const res = await response.json();
    console.log(res)
    if (!res.success) throw new Error('Failed to upload data');

    return res.fileUrl as string;
}


// ✅ UPDATED: Add PaymentHistoryData[] and PIApprovalSheet[] to the return type
export async function fetchSheet(
    sheetName: Sheet
): Promise<MasterSheet | IndentSheet[] | ReceivedSheet[] | UserPermissions[] | PoMasterSheet[] | InventorySheet[] | StoreInSheet[] | IssueSheet[] | TallyEntrySheet[] | PcReportSheet[] | PaymentHistoryData[] | PIApprovalSheet[]> {
    const url = `${import.meta.env.VITE_APP_SCRIPT_URL}?sheetName=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);

    console.log(`📊 Fetching sheet: ${sheetName}`, response);

    if (!response.ok) throw new Error('Failed to fetch data');
    const raw = await response.json();
    if (!raw.success) throw new Error('Something went wrong when parsing data');

    // ✅ ADDED: Payment History case
    if (sheetName === 'Payment History' ) {
        console.log("💰 Processing Payment History data:", raw.rows);
        
        if (!raw.rows || !Array.isArray(raw.rows)) {
            console.warn("⚠️ No payment history rows found");
            return [];
        }

        const paymentData = raw.rows.map((record: any) => {
            console.log("📝 Payment record:", record);
            
            return {
                timestamp: record.Timestamp || record.timestamp || '',
                apPaymentNumber: record['AP-Payment Number'] || record.apPaymentNumber || '',
                status: record.Status || record.status || 'Yes',
                uniqueNumber: record['Unique Number'] || record.uniqueNumber || '',
                fmsName: record['Fms Name'] || record.fmsName || '',
                payTo: record['Pay To'] || record.payTo || '',
                amountToBePaid: parseFloat(record['Amount To Be Paid'] || record.amountToBePaid || 0),
                remarks: record.Remarks || record.remarks || '',
                anyAttachments: record['Any Attachments'] || record.anyAttachments || '',
            } as PaymentHistoryData;
        });

        // Filter out empty records
       const filteredData = paymentData.filter((record: PaymentHistoryData) => 
    record.timestamp || 
    record.apPaymentNumber || 
    record.uniqueNumber || 
    record.payTo
);

        console.log(`✅ Processed ${filteredData.length} payment history records`);
        return filteredData;
    }

    // ✅ ADD: PI Approval case
// Update the PI Approval case in fetchSheet function
// Update the PI Approval case in fetchSheet function
// Update the PI Approval case in fetchSheet function
// Update the PI Approval case in fetchSheet function
if (sheetName === 'PI APPROVAL' ) {
    console.log("📋 Processing PI Approval data:", raw.rows);
    
    if (!raw.rows || !Array.isArray(raw.rows)) {
        console.warn("⚠️ No PI Approval rows found");
        return [];
    }

    const piApprovalData = raw.rows.map((record: any, index: number) => {
        console.log(`📝 PI Approval record ${index}:`, record);
        
        // Debug: Log all keys to see what's available
        if (index === 0) {
            console.log("🔍 All available keys in record:", Object.keys(record));
            console.log("🔍 P.I Copy value from record:", record['P.I Copy'], record['PI Copy'], record.pICopy, record.piCopy);
        }
        
        // Map all columns with fallbacks - IMPORTANT: Use bracket notation for keys with dots/spaces
        const data = {
            rowIndex: record.rowIndex || index + 2,
            timestamp: record.timestamp || record.Timestamp || '',
            
            // Main PI fields
            piNo: record.piNo || record['PI-No.'] || record.pINo || '',
            indentNo: record.indentNo || record['Indent No.'] || record.indentNumber || '',
            partyName: record.partyName || record['Party Name'] || '',
            productName: record.productName || record['Product Name'] || '',
            qty: parseFloat(record.qty || record.Qty || 0),
            piAmount: parseFloat(record.piAmount || record['P.I Amount'] || record.pIAmount || 0),
            
            // IMPORTANT: Try multiple variations for PI Copy
            piCopy: record['P.I Copy'] || record['P.I Copy '] || record['PI Copy'] || record.piCopy || record.pICopy || '',
            
            poRateWithoutTax: parseFloat(record.poRateWithoutTax || record['Po Rate Without Tax'] || 0),
            
            // PO Master fields
            poNumber: record.poNumber || record['PO Number'] || '',
            deliveryDate: record.deliveryDate || record['Delivery Date'] || '',
            paymentTerms: record.paymentTerms || record['Payment Terms'] || '',
            internalCode: record.internalCode || record['Internal Code'] || '',
            totalPoAmount: parseFloat(record.totalPoAmount || record['Total PO Amount'] || 0),
            
            // Try multiple variations for PO Copy
            poCopy: record.poCopy || record['PO Copy'] || record['Po Copy'] || '',
            
            numberOfDays: parseInt(record.numberOfDays || record['Number Of Days'] || 0),
            
            // Payment fields
            totalPaidAmount: parseFloat(record.totalPaidAmount || record['Total Paid Amount'] || 0),
            outstandingAmount: parseFloat(record.outstandingAmount || record['Outstanding Amount'] || 0),
            
            // Status and date fields
            status: record.status || record.Status || '', // First Status column
            planned: record.planned || record.Planned || '',
            actual: record.actual || record.Actual || '',
            delay: record.delay || record.Delay || '',
            status2: record.status2 || record['Status_2'] || record.Status2 || '', // Second Status column
            paymentForm: record.paymentForm || record['Payment Form'] || '',
        };

        if (index < 3) {
            console.log(`📝 Processed data ${index}:`, {
                indentNo: data.indentNo,
                piCopy: data.piCopy,
                poCopy: data.poCopy,
                planned: data.planned,
                actual: data.actual
            });
        }
        
        return data as PIApprovalSheet;
    });

    // Filter out empty records
    const filteredData = piApprovalData.filter((record: PIApprovalSheet) => 
        record.indentNo && record.indentNo.trim() !== ''
    );

    console.log(`✅ Processed ${filteredData.length} PI Approval records`);
    console.log('Sample records (first 3):', filteredData.slice(0, 3));
    
    return filteredData;
}


    if (sheetName === 'MASTER') {
        const data = raw.options;
        
        console.log("🔍 Raw Master Sheet Data:", data);
        
        // ✅ Define proper interface
        interface GroupHeads {
            [key: string]: string[];
        }
        
        let groupHeads: GroupHeads = {};
        
        if (data.groupHeads && typeof data.groupHeads === 'object') {
            groupHeads = data.groupHeads as GroupHeads;
            console.log("✅ Using structured groupHeads from backend:", Object.keys(groupHeads).length);
        } else {
            const buildGroupHeads = (): GroupHeads => {
                const result: GroupHeads = {};
                const dataArrays = Object.values(data).filter((arr): arr is unknown[] => Array.isArray(arr));
                const length = Math.max(...dataArrays.map((arr) => arr.length));
                
                for (let i = 0; i < length; i++) {
                    const group = data.groupHead?.[i];
                    const item = data.itemName?.[i];
                    
                    if (isValidString(group) && isValidString(item)) {
                        if (!result[group]) {
                            result[group] = [];
                        }
                        if (!result[group].includes(item)) {
                            result[group].push(item);
                        }
                    }
                }
                
                return result;
            };
            
            function isValidString(value: unknown): value is string {
                return typeof value === 'string' && value.trim() !== '';
            }
            
            groupHeads = buildGroupHeads();
            console.log("⚠️ Using fallback groupHeads parsing:", Object.keys(groupHeads).length);
        }
        
        console.log("📦 FINAL - Group Heads:", groupHeads);

        // ✅ Vendors processing
        let vendors: Vendor[] = [];
        
        if (data.vendors && Array.isArray(data.vendors)) {
            vendors = data.vendors.map((v: any) => ({
                vendorName: v.vendorName || '',
                address: v.address || '',
                gstin: v.gstin || '',
                vendorEmail: v.email || v.vendorEmail || ''
            }));
            console.log("✅ Using vendors array from backend:", vendors.length);
        } else {
            const length = Math.max(...Object.values(data).map((arr) => (arr as unknown[]).length));
            const vendorMap = new Map<string, Vendor>();
            
            for (let i = 0; i < length; i++) {
                const vendorName = data.vendorName?.[i];
                if (vendorName && !vendorMap.has(vendorName)) {
                    vendorMap.set(vendorName, {
                        vendorName,
                        gstin: data.vendorGstin?.[i] || '',
                        address: data.vendorAddress?.[i] || '',
                        email: data.vendorEmail?.[i] || ''
                        
                    });
                }
            }
            vendors = Array.from(vendorMap.values());
            console.log("⚠️ Using fallback vendor parsing:", vendors.length);
        }
        
        console.log("📦 FINAL - Total vendors:", vendors.length);

        // ✅ Parse ALL data properly - Build Sets first
        const length = Math.max(...Object.values(data).map((arr) => (arr as unknown[]).length));
        const departments = new Set<string>();
        const paymentTerms = new Set<string>();
        const defaultTerms = new Set<string>();
        const uoms = new Set<string>();
        const firms = new Set<string>();
        const fmsNames = new Set<string>();
        const firmCompanyMap: Record<string, { companyName: string; companyAddress: string; destinationAddress: string }> = {};

        for (let i = 0; i < length; i++) {
            if (data.department && data.department[i] && data.department[i].toString().trim()) {
                departments.add(data.department[i].toString().trim());
            }
            if (data.paymentTerm && data.paymentTerm[i] && data.paymentTerm[i].toString().trim()) {
                paymentTerms.add(data.paymentTerm[i].toString().trim());
            }
            // ✅ FIXED: Properly handle defaultTerms - check both singular and plural
            if (data.defaultTerms && data.defaultTerms[i] && data.defaultTerms[i].toString().trim()) {
                defaultTerms.add(data.defaultTerms[i].toString().trim());
            }
            if (data.defaultTerm && data.defaultTerm[i] && data.defaultTerm[i].toString().trim()) {
                defaultTerms.add(data.defaultTerm[i].toString().trim());
            }
            if (data.uom && data.uom[i] && data.uom[i].toString().trim()) {
                uoms.add(data.uom[i].toString().trim());
            }
            if (data.firmName && data.firmName[i] && data.firmName[i].toString().trim()) {
                firms.add(data.firmName[i].toString().trim());
            }
            if (data.fmsName && data.fmsName[i] && data.fmsName[i].toString().trim()) {
                fmsNames.add(data.fmsName[i].toString().trim());
            }

            const firmName = data.firmName?.[i];
            const companyName = data.companyName?.[i];
            const companyAddress = data.companyAddress?.[i];
            const destinationAddress = data.destinationAddress?.[i];
            
            if (firmName && companyName && companyAddress) {
                firmCompanyMap[firmName.toString().trim()] = {
                    companyName: companyName.toString().trim(),
                    companyAddress: companyAddress.toString().trim(),
                    destinationAddress: (destinationAddress || companyAddress).toString().trim()
                };
            }
        }

        // ✅ Process ALL dropdown arrays with proper fallbacks
        let finalDepartments: string[] = [];
        if (data.departments && Array.isArray(data.departments)) {
            finalDepartments = [...new Set(
                (data.departments as unknown[])
                    .filter((dept: unknown) => dept != null && String(dept).trim() !== '')
                    .map((dept: unknown) => String(dept).trim())
            )];
            console.log("✅ Using departments array from backend:", finalDepartments.length);
        } else if (data.department && Array.isArray(data.department)) {
            finalDepartments = [...new Set(
                (data.department as unknown[])
                    .filter((dept: unknown) => dept != null && String(dept).trim() !== '')
                    .map((dept: unknown) => String(dept).trim())
            )];
            console.log("🔄 Using department array as fallback:", finalDepartments.length);
        } else {
            finalDepartments = [...departments];
            console.log("⚠️ Using departments from Set:", finalDepartments.length);
        }

        // ✅ Default Terms processing - ADD THIS NEW SECTION
        let finalDefaultTerms: string[] = [];
        if (data.defaultTerms && Array.isArray(data.defaultTerms)) {
            finalDefaultTerms = [...new Set(
                (data.defaultTerms as unknown[])
                    .filter((term: unknown) => term != null && String(term).trim() !== '')
                    .map((term: unknown) => String(term).trim())
            )];
            console.log("✅ Using default terms array from backend:", finalDefaultTerms.length);
        } else if (data.defaultTerm && Array.isArray(data.defaultTerm)) {
            finalDefaultTerms = [...new Set(
                (data.defaultTerm as unknown[])
                    .filter((term: unknown) => term != null && String(term).trim() !== '')
                    .map((term: unknown) => String(term).trim())
            )];
            console.log("🔄 Using defaultTerm array as fallback:", finalDefaultTerms.length);
        } else {
            finalDefaultTerms = [...defaultTerms];
            console.log("⚠️ Using default terms from Set:", finalDefaultTerms.length);
        }

        let finalUoms: string[] = [];
        if (data.uoms && Array.isArray(data.uoms)) {
            finalUoms = [...new Set(
                (data.uoms as unknown[])
                    .filter((uom: unknown) => uom != null && String(uom).trim() !== '')
                    .map((uom: unknown) => String(uom).trim())
            )];
            console.log("✅ Using UOMs array from backend:", finalUoms.length);
        } else if (data.uom && Array.isArray(data.uom)) {
            finalUoms = [...new Set(
                (data.uom as unknown[])
                    .filter((uom: unknown) => uom != null && String(uom).trim() !== '')
                    .map((uom: unknown) => String(uom).trim())
            )];
            console.log("🔄 Using UOM array as fallback:", finalUoms.length);
        } else {
            finalUoms = [...uoms];
            console.log("⚠️ Using UOMs from Set:", finalUoms.length);
        }

        let finalFirms: string[] = [];
        if (data.firms && Array.isArray(data.firms)) {
            finalFirms = [...new Set(
                (data.firms as unknown[])
                    .filter((firm: unknown) => firm != null && String(firm).trim() !== '')
                    .map((firm: unknown) => String(firm).trim())
            )];
            console.log("✅ Using firms array from backend:", finalFirms.length);
        } else if (data.firmName && Array.isArray(data.firmName)) {
            finalFirms = [...new Set(
                (data.firmName as unknown[])
                    .filter((firm: unknown) => firm != null && String(firm).trim() !== '')
                    .map((firm: unknown) => String(firm).trim())
            )];
            console.log("🔄 Using firmName array as fallback:", finalFirms.length);
        } else {
            finalFirms = [...firms];
            console.log("⚠️ Using firms from Set:", finalFirms.length);
        }

        // ✅ Payment Terms processing
        let finalPaymentTerms: string[] = [];
        if (data.paymentTerms && Array.isArray(data.paymentTerms)) {
            finalPaymentTerms = [...new Set(
                (data.paymentTerms as unknown[])
                    .filter((term: unknown) => term != null && String(term).trim() !== '')
                    .map((term: unknown) => String(term).trim())
            )];
            console.log("✅ Using payment terms array from backend:", finalPaymentTerms.length);
        } else if (data.paymentTerm && Array.isArray(data.paymentTerm)) {
            finalPaymentTerms = [...new Set(
                (data.paymentTerm as unknown[])
                    .filter((term: unknown) => term != null && String(term).trim() !== '')
                    .map((term: unknown) => String(term).trim())
            )];
            console.log("🔄 Using paymentTerm array as fallback:", finalPaymentTerms.length);
        } else {
            finalPaymentTerms = [...paymentTerms];
            console.log("⚠️ Using payment terms from Set:", finalPaymentTerms.length);
        }

        // ✅ FIXED: Log AFTER all variables are defined
        console.log("📋 FINAL - All Dropdown Data:", {
            vendors: vendors.length,
            departments: finalDepartments.length,
            paymentTerms: finalPaymentTerms.length,
            defaultTerms: finalDefaultTerms.length,  // ✅ ADD THIS
            uoms: finalUoms.length,
            firms: finalFirms.length,
            groupHeads: Object.keys(groupHeads).length
        });

        return {
            vendors: vendors,
            vendorNames: vendors.map(v => v.vendorName),
            departments: finalDepartments,
            paymentTerms: finalPaymentTerms,
            groupHeads: groupHeads,
            companyPan: data.companyPan?.[0] || '',
            companyName: data.companyName?.[0] || '',
            companyAddress: data.companyAddress?.[0] || '',
            companyPhone: data.companyPhone?.[0] || '',
            companyGstin: data.companyGstin?.[0] || '',
            billingAddress: data.billingAddress?.[0] || '',
            destinationAddress: data.destinationAddress?.[0] || '',
            defaultTerms: finalDefaultTerms,  // ✅ CHANGED: Use finalDefaultTerms instead of [...defaultTerms]
            uoms: finalUoms,
            firms: finalFirms,
            fmsNames: [...fmsNames],
            firmCompanyMap,
            firmsnames: data.firmsnames ?? [],
        };
    }

    return raw.rows.filter((r: IndentSheet) => r.timestamp !== '');
}


export async function postToSheet(
    data:
        | Partial<IndentSheet>[]
        | Partial<ReceivedSheet>[]
        | Partial<UserPermissions>[]
        | Partial<PoMasterSheet>[]
        | Partial<StoreInSheet>[]
        | Partial<TallyEntrySheet>[]
        | Partial<PcReportSheet>[],
    action: 'insert' | 'update' | 'delete' = 'insert',
    sheet: Sheet = 'INDENT'
) {
    try {
        const form = new FormData();
        form.append('action', action);
        form.append('sheetName', sheet);
        form.append('rows', JSON.stringify(data));

        console.log("form", form);

        const response = await fetch(import.meta.env.VITE_APP_SCRIPT_URL, {
            method: 'POST',
            body: form,
            redirect: 'follow', // ✅ Add this
            mode: 'cors',       // ✅ Add this
            credentials: 'omit' // ✅ Add this
        });

        // ✅ Handle response properly
        if (!response.ok) {
            console.error(`Error in fetch: ${response.status} - ${response.statusText}`);
            throw new Error(`Failed to ${action} data`);
        }

        // ✅ Parse response as text first, then JSON
        const textResponse = await response.text();
        const res = JSON.parse(textResponse);
        
        if (!res.success) {
            console.error(`Error in response: ${res.error || res.message}`);
            throw new Error(res.error || 'Something went wrong in the API');
        }

        return res; // ✅ Return the result
    } catch (error) {
        console.error('Error in postToSheet:', error);
        throw error;
    }
}


export const postToIssueSheet = async (
    data: Partial<IssueSheet>[],
    action: 'insert' | 'update' | 'delete' = 'insert'
) => {
    const form = new FormData();
    form.append('action', action);
    form.append('sheetName', 'ISSUE'); // Use 'ISSUE' as the sheet name
    form.append('rows', JSON.stringify(data));

    // Proper way to inspect FormData contents
    console.log("FormData contents:");
    for (const [key, value] of form.entries()) {
        console.log(key, value);
    }

    const response = await fetch(import.meta.env.VITE_APP_SCRIPT_URL, {
        method: 'POST',
        body: form,
    });

    if (!response.ok) {
        console.error(`Error in fetch: ${response.status} - ${response.statusText}`);
        throw new Error(`Failed to ${action} data`);
    }

    const res = await response.json();
    if (!res.success) {
        console.error(`Error in response: ${res.message}`);
        throw new Error('Something went wrong in the API');
    }

    return res;
};
