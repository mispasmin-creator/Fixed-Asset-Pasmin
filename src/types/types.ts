// ✅ PAYMENT HISTORY - CORRECT
export interface PaymentHistory {
  timestamp: string;
  apPaymentNumber: string |number;
  status: string;
  uniqueNumber: string;
  fmsName: string;
  payTo: string;
  amountToBePaid: string |number;
  remarks: string;
  anyAttachments: string;
}

// ✅ PI APPROVAL - CORRECT
export type PIApprovalSheet = {
    rowIndex?: number;
    sheetName?: string;
    timestamp: string;
    piNo: string;                    // PI-No.
    indentNo: string;                // Indent No.
    partyName: string;               // Party Name
    productName: string;             // Product Name
    qty: number;                     // Qty
    piAmount: number;                // P.I Amount
    piCopy: string;                  // P.I Copy
    poRateWithoutTax: number;        // PO Rate Without Tax
    poNumber: string;                // PO Number
    deliveryDate: string;            // Delivery Date
    paymentTerms: string;            // Payment Terms
    internalCode: string;            // Internal Code
    totalPoAmount: number;           // Total PO Amount
    poCopy: string;                  // PO Copy
    numberOfDays: number;            // Number Of Days
    totalPaidAmount: number;         // Total Paid Amount
    outstandingAmount: number;       // Outstanding Amount
    status: string;                  // Status (Column S)
    planned: string;                 // Planned
    actual: string;                  // Actual
    delay: string;                   // Delay
    status1: string;                 // Status1 (Column W - the one we update)
    paymentForm: string;             // Payment Form
    firmNameMatch?: string;          // Firm Name Match
};
// ✅ SHEET TYPE - CORRECT (but standardize casing)
export type Sheet = 
  | 'MASTER' 
  | 'INDENT' 
  | 'RECEIVED' 
  | 'USER' 
  | 'PO MASTER' 
  | 'INVENTORY' 
  | 'STORE IN' 
  | 'ISSUE' 
  | 'TALLY ENTRY' 
  | 'PC REPORT'
  | 'Fullkitting'      // ✅ Keep exact case from your backend
  | 'Payment History'  // ✅ Keep exact case
  | 'PI APPROVAL';     // ✅ Keep exact case

// ❌ NEEDS UPDATES - Missing critical fields for PI Approval integration
export interface PoMasterSheet {
    rowIndex?: number;  // ✅ CRITICAL: Added for updates
    timestamp: string;
    partyName: string;
    poNumber: string;
    internalCode: string;
    product: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    gst: number;
    discount: number;
    amount: number;
    totalPoAmount: number;
    pdf: string;
    preparedBy: string;
    approvedBy: string;
    quotationNumber: string;
    quotationDate: string;
    enquiryNumber: string;
    enquiryDate: string;
    term1: string;
    term2: string;
    term3: string;
    term4: string;
    term5: string;
    term6: string;
    term7: string;
    term8: string;
    term9: string;
    term10: string;
    discountPercent?: number;
    gstPercent?: number;
    
    // ✅ CRITICAL: Added fields from your PO MASTER sheet
    deliveryDate?: string;
    paymentTerms?: string;
    numberOfDays?: number;
    deliveryDays?: number;
    deliveryType?: string;
    emailSendStatus?: string;
    firmNameMatch?: string;  // ✅ IMPORTANT: For firm filtering
    
    // ✅ CRITICAL: Added for PI Approval integration
    piApprovalTimestamp?: string;  // When PI was approved
    piQty?: number;                // PI quantity
    piAmount?: number;             // PI amount
    piCopy?: string;               // PI copy URL
    poRateWithoutTax?: number;
    'Guarantee'?: string;
    'Freight Payment'?: string;     // PO rate without tax
}
