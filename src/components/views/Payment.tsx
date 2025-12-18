import { useSheets } from '@/context/SheetsContext';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { useEffect, useState, useCallback } from 'react';
import DataTable from '../element/DataTable';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { CreditCard, ExternalLink, Truck, DollarSign, FileText, Package, MapPin, Receipt, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface FreightPaymentData {
    indentNumber: string;
    vendorName: string;
    vehicleNumber: string;
    from: string;
    to: string;
    materialLoadDetails: string;
    biltyNumber: number;
    rateType: string;
    amount1: number;
    biltyImage: string;
    
    firmNameMatch: string;
    paymentForm: string;  // Contains the Google Form link
    fFPPaymentNumber: string;
}

export default function FreightPayment() {
    const { fullkittingSheet, fullkittingLoading } = useSheets();
    const [tableData, setTableData] = useState<FreightPaymentData[]>([]);
    const { user } = useAuth();

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0
    });

    // Function to validate and clean Google Form URLs
    const getValidGoogleFormLink = useCallback((link: string): string => {
        if (!link || link.trim() === '') return '';
        
        const trimmedLink = link.trim();
        
        // Check if it's a valid Google Form URL
        const isGoogleForm = trimmedLink.includes('docs.google.com/forms') || 
                             trimmedLink.includes('forms.gle');
        
        // If it's already a Google Form link, return it as is
        if (isGoogleForm) {
            return trimmedLink.startsWith('http') ? trimmedLink : `https://${trimmedLink}`;
        }
        
        // If it's not a Google Form, show error
        console.warn('Invalid Google Form link:', trimmedLink);
        return '';
    }, []);

    // Function to handle payment button click
    const handleMakePayment = useCallback((item: FreightPaymentData) => {
        const googleFormLink = getValidGoogleFormLink(item.paymentForm);
        
        if (!googleFormLink) {
            toast.error('No valid Google Form link available for this item');
            return;
        }

        // Open Google Form in a new tab with security attributes
        const newWindow = window.open(
            googleFormLink, 
            '_blank', 
            'noopener,noreferrer,width=800,height=600'
        );
        
        if (newWindow) {
            newWindow.opener = null;
            toast.info(`Opening payment form for ${item.indentNumber}...`);
        } else {
            toast.error('Please allow popups to open the payment form');
        }
    }, [getValidGoogleFormLink]);

    useEffect(() => {
        // Filter items where Planned1 is not empty and Actual1 is empty
        const filteredByFirm = fullkittingSheet.filter(item => 
            user.firmNameMatch.toLowerCase() === "all" || item.firmNameMatch === user.firmNameMatch
        );

        const pendingItems = filteredByFirm.filter(item => 
            item.planned1 && item.planned1 !== '' && (!item.actual1 || item.actual1 === '')
        );
        
        const completedItems = filteredByFirm.filter(item => 
            item.actual1 && item.actual1 !== ''
        );

        // Process data and validate links
        const processedData = pendingItems.map((item) => {
            const paymentFormLink = getValidGoogleFormLink(item.paymentForm || '');
            
            return {
                indentNumber: item.indentNumber || '',
                vendorName: item.vendorName || '',
                vehicleNumber: item.vehicleNumber || item.vehicleNo || '',
                from: item.from || '',
                to: item.to || '',
                materialLoadDetails: item.materialLoadDetails || '',
                biltyNumber: item.biltyNumber || 0,
                rateType: item.rateType || '',
                amount1: item.amount1 || 0,
                biltyImage: item.biltyImage || '',
                firmNameMatch: item.firmNameMatch || '',
                paymentForm: paymentFormLink, // Store validated link
                fFPPaymentNumber: item.fFPPaymentNumber || '',
            };
        });

        setTableData(processedData);

        setStats({
            total: filteredByFirm.length,
            pending: pendingItems.length,
            completed: completedItems.length
        });
    }, [fullkittingSheet, user.firmNameMatch, getValidGoogleFormLink]);

    const columns: ColumnDef<FreightPaymentData>[] = [
        {
            header: 'Action',
            cell: ({ row }: { row: Row<FreightPaymentData> }) => {
                const item = row.original;
                const hasValidLink = item.paymentForm && item.paymentForm !== '';
                
                return (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMakePayment(item)}
                        disabled={!hasValidLink}
                        className={`${hasValidLink ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} shadow-sm`}
                    >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        {hasValidLink ? 'Make Payment' : 'No Form'}
                    </Button>
                );
            },
        },
        { 
            accessorKey: 'indentNumber', 
            header: 'Indent No.',
            cell: ({ row }) => (
                <span className="font-medium text-blue-700">{row.original.indentNumber}</span>
            )
        },
        { 
            accessorKey: 'firmNameMatch', 
            header: 'Firm',
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-gray-50">
                    {row.original.firmNameMatch}
                </Badge>
            )
        },
        { 
            accessorKey: 'vendorName', 
            header: 'Vendor Name',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.vendorName}</span>
            )
        },
        { 
            accessorKey: 'vehicleNumber', 
            header: 'Vehicle No.',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Car className="h-3 w-3 text-gray-500" />
                    <span className="font-medium text-gray-800">{row.original.vehicleNumber}</span>
                </div>
            )
        },
        { 
            accessorKey: 'from', 
            header: 'From',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">{row.original.from}</span>
                </div>
            )
        },
        { 
            accessorKey: 'to', 
            header: 'To',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700">{row.original.to}</span>
                </div>
            )
        },
        { 
            accessorKey: 'materialLoadDetails', 
            header: 'Material Details',
            cell: ({ row }) => (
                <div className="max-w-[150px] truncate" title={row.original.materialLoadDetails}>
                    <Package className="inline h-3 w-3 mr-1 text-gray-500" />
                    {row.original.materialLoadDetails || '-'}
                </div>
            )
        },
        { 
            accessorKey: 'biltyNumber', 
            header: 'Bilty No.',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-gray-500" />
                    <span className="font-medium text-gray-800">{row.original.biltyNumber || '-'}</span>
                </div>
            )
        },
        { 
            accessorKey: 'rateType', 
            header: 'Rate Type',
            cell: ({ row }) => (
                <Badge variant="outline" className={row.original.rateType === 'Fixed' ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                    {row.original.rateType}
                </Badge>
            )
        },
        { 
            accessorKey: 'amount1', 
            header: 'Amount',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="font-semibold text-green-600">₹{row.original.amount1?.toFixed(2) || '0.00'}</span>
                </div>
            )
        },
        { 
            accessorKey: 'biltyImage', 
            header: 'Bilty Image',
            cell: ({ row }) => (
                row.original.biltyImage ? (
                    <a 
                        href={row.original.biltyImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                    >
                        <FileText size={12} />
                        View
                    </a>
                ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                )
            )
        },
        // { 
        //     accessorKey: 'paymentForm', 
        //     header: 'Form Link',
        //     cell: ({ row }) => {
        //         const link = row.original.paymentForm;
        //         return link ? (
        //             <a 
        //                 href={link} 
        //                 target="_blank" 
        //                 rel="noopener noreferrer"
        //                 className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
        //                 onClick={(e) => {
        //                     e.preventDefault();
        //                     handleMakePayment(row.original);
        //                 }}
        //             >
        //                 <ExternalLink size={12} />
        //                 Open Form
        //             </a>
        //         ) : (
        //             <span className="text-gray-400 text-sm">No Link</span>
        //         );
        //     }
        // },
        // { 
        //     accessorKey: 'fFPPaymentNumber', 
        //     header: 'FFP No.',
        //     cell: ({ row }) => (
        //         <span className="font-medium text-purple-700">{row.original.fFPPaymentNumber || '-'}</span>
        //     )
        // },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-600 rounded-lg shadow">
                            <CreditCard size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Freight Payment</h1>
                            <p className="text-gray-600">Click "Make Payment" to open Google Form for each freight item</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="bg-white shadow border-0 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Freight Items</p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                                    </div>
                                    <Truck className="h-10 w-10 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white shadow border-0 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                                        <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                                    </div>
                                    <div className="h-10 w-10 flex items-center justify-center bg-amber-100 rounded-full">
                                        <DollarSign className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white shadow border-0 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Payment Completed</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
                                    </div>
                                    <div className="h-10 w-10 flex items-center justify-center bg-green-100 rounded-full">
                                        <FileText className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card className="bg-white shadow-lg border-0 mb-6">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-800">
                                    Pending Freight Payments ({stats.pending})
                                </CardTitle>
                                <p className="text-gray-600 text-sm mt-1">
                                    Items with Planned1 date but no Actual1 date
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {stats.pending} Pending
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                    
                        <DataTable
                            data={tableData}
                            columns={columns}
                            searchFields={['indentNumber', 'vendorName', 'vehicleNumber', 'from', 'to', 'biltyNumber', 'fFPPaymentNumber']}
                            dataLoading={fullkittingLoading}
                            className="border rounded-lg"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}