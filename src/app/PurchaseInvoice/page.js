'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, Search, Printer, Trash2, Edit, Save, XCircle, Home, List } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function PurchaseInvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('list');
    const [editingInvoice, setEditingInvoice] = useState(null);

    const [formData, setFormData] = useState({
        supplier: { name: '', phone: '', address: '' },
        products: [],
        creatorName: '',
        creatorId: '',
        subtotal: 0,
        tax: 0,
        discount: 0,
        totalAmount: 0,
        paymentMethod: 'نقدي',
        notes: ''
    });

    const [currentProduct, setCurrentProduct] = useState({
        name: '',
        quantity: 1,
        purchasePrice: 0,
        total: 0
    });

    useEffect(() => {
        fetchInvoices();
    }, []);




    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/purchase-invoices');
            const data = await res.json();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        if (!currentProduct.name || currentProduct.quantity <= 0 || currentProduct.purchasePrice <= 0) {
            Swal.fire({ icon: 'error', title: 'خطأ', text: 'يرجى تعبئة جميع تفاصيل المنتج.' });
            return;
        }

        const updatedProducts = [...formData.products, currentProduct];
        const subtotal = updatedProducts.reduce((sum, p) => sum + p.total, 0);
        const totalAmount = subtotal + formData.tax - formData.discount;

        setFormData({
            ...formData,
            products: updatedProducts,
            subtotal,
            totalAmount
        });

        setCurrentProduct({
            name: '',
            quantity: 1,
            purchasePrice: 0,
            total: 0
        });
    };

    const handleSubmitInvoice = async () => {
        if (!formData.supplier.name || !formData.creatorName || !formData.creatorId || formData.products.length === 0) {
            Swal.fire({ icon: 'error', title: 'خطأ', text: 'يجب تعبئة جميع الحقول المطلوبة: اسم المورد، منشئ الفاتورة، والمنتجات.' });
            return;
        }

        try {
            const method = editingInvoice ? 'PUT' : 'POST';
            const url = editingInvoice ? `/api/purchase-invoices` : '/api/purchase-invoices';
            const body = editingInvoice
                ? { id: editingInvoice._id, updatedData: formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                Swal.fire({ icon: 'success', title: editingInvoice ? 'نجاح' : 'نجاح', text: editingInvoice ? 'تم تحديث الفاتورة بنجاح' : 'تم حفظ الفاتورة بنجاح' });
                fetchInvoices();
                setActiveTab('list');
                resetForm();
            } else {
                const errorData = await res.json();
                Swal.fire({ icon: 'error', title: 'خطأ', text: errorData.error || 'حدث خطأ أثناء حفظ الفاتورة.' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'خطأ', text: 'حدث خطأ غير متوقع.' });
        }
    };

    const resetForm = () => {
        setFormData({
            supplier: { name: '', phone: '', address: '' },
            products: [],
            creatorName: '',
            creatorId: '',
            subtotal: 0,
            tax: 0,
            discount: 0,
            totalAmount: 0,
            paymentMethod: 'نقدي',
            notes: ''
        });
        setEditingInvoice(null);
    };

    const handleEditInvoice = (invoice) => {
        setEditingInvoice(invoice);
        setFormData({
            supplier: invoice.supplier,
            products: invoice.products,
            creatorName: invoice.creatorName,
            creatorId: invoice.creatorId,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            discount: invoice.discount,
            totalAmount: invoice.totalAmount,
            paymentMethod: invoice.paymentMethod,
            notes: invoice.notes
        });
        setActiveTab('create');
    };

    const handleDeleteInvoice = async (id) => {
        const result = await Swal.fire({
            title: '<span class="text-2xl text-red-600">تحذير!</span>',
            html: `
            <div class="text-right text-gray-700">
                <div class="flex items-center gap-3 justify-end">
                    <svg class="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <div>
                        <p class="text-lg font-medium">لن تتمكن من استعادة الفاتورة بعد الحذف!</p>
                        <p class="text-sm text-gray-500 mt-1">التأكيد سيقوم بحذف الفاتورة بشكل دائم</p>
                    </div>
                </div>
            </div>
        `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذفها!',
            cancelButtonText: 'إلغاء',
            reverseButtons: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3B82F6',
            background: '#fff',
            customClass: {
                popup: 'rounded-2xl shadow-xl'
            }
        });
        if (result.isConfirmed) {
            try {
                const res = await fetch('/api/purchase-invoices', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });

                if (res.ok) {
                    Swal.fire('تم الحذف!', 'تم حذف الفاتورة بنجاح.', 'success');
                    fetchInvoices();
                } else {
                    const errorData = await res.json();
                    Swal.fire('خطأ!', errorData.error || 'حدث خطأ أثناء حذف الفاتورة.', 'error');
                }
            } catch (error) {
                Swal.fire('خطأ!', 'حدث خطأ غير متوقع.', 'error');
            }
        }
    };


    const handlePrintInvoice = (invoice) => {
        const printWindow = window.open('', '_blank');
        const printDate = new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // جلب إعدادات المتجر من localStorage
        const storeInfo = JSON.parse(localStorage.getItem('storeInfo')) || {
            logo: '/logo1.png',
            name: 'متجرك',
            phone: '01007488071'
        };

        printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <title>فاتورة شراء - ${invoice.invoiceNumber}</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    padding: 20px;
                }
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                }
                .store-info {
                    text-align: right;
                }
                .store-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e3a8a;
                    margin-bottom: 5px;
                }
                .store-details {
                    font-size: 14px;
                    color: #4b5563;
                }
                .logo {
                    max-width: 150px;
                    height: auto;
                }
                .invoice-info {
                    margin-top: 20px;
                    background: #f3f4f6;
                    padding: 15px;
                    border-radius: 8px;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 25px 0;
                }
                .invoice-table th {
                    background: #3B82F6;
                    color: white;
                    padding: 12px;
                    text-align: right;
                }
                .invoice-table td {
                    padding: 12px;
                    border-bottom: 1px solid #ddd;
                    text-align: right;
                }
                .total-section {
                    margin-top: 30px;
                    font-size: 18px;
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #000;
                    text-align: center;
                    font-size: 14px;
                    color: #6b7280;
                }
            </style>
        </head>
        <body>
            <!-- Header Section -->
            <div class="header-container">
                <div class="store-info">
                    <div class="store-name">${storeInfo.name}</div>
                    <div class="store-details">
                        <p>${storeInfo.address}</p>
                        <p>تليفون: ${storeInfo.phone}</p>
                    </div>
                </div>
                ${storeInfo.logo && `
                    <img 
                        src="${storeInfo.logo}" 
                        alt="شعار المتجر" 
                        class="logo"
                        onerror="this.style.display='none'"
                    >
                `}
            </div>
    
            <!-- Invoice Info -->
            <div class="invoice-info">
                <h1 class="store-name">فاتورة شراء - #${invoice.invoiceNumber}</h1>
                <p>تاريخ الفاتورة: ${new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</p>
                <p>تاريخ الطباعة: ${printDate} - ${new Date().toLocaleTimeString('ar-EG')}</p>
            </div>
    
            <!-- Supplier Info -->
            <div class="invoice-info">
                <h2>معلومات المورد:</h2>
                <p>الاسم: ${invoice.supplier.name}</p>
                <p>الهاتف: ${invoice.supplier.phone}</p>
                <p>العنوان: ${invoice.supplier.address}</p>
            </div>
    
            <!-- Products Table -->
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>سعر الشراء</th>
                        <th>المجموع</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.products.map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.quantity}</td>
                            <td>${product.purchasePrice.toLocaleString()} ج.م</td>
                            <td>${product.total.toLocaleString()} ج.م</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
    
            <!-- Totals -->
            <div class="total-section">
                <div class="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>${invoice.subtotal.toLocaleString()} ج.م</span>
                </div>
                <div class="flex justify-between">
                    <span>الضريبة:</span>
                    <span>${invoice.tax.toLocaleString()} ج.م</span>
                </div>
                <div class="flex justify-between">
                    <span>الخصم:</span>
                    <span>${invoice.discount.toLocaleString()} ج.م</span>
                </div>
                <div class="flex justify-between" style="margin-top: 15px; font-weight: bold;">
                    <span>المجموع النهائي:</span>
                    <span style="color: #1e3a8a;">${invoice.totalAmount.toLocaleString()} ج.م</span>
                </div>
            </div>
    
            <!-- Footer -->
            <div class="footer">
                <p>طريقة الدفع: ${invoice.paymentMethod}</p>
                ${invoice.notes && `<p>ملاحظات: ${invoice.notes}</p>`}
                <p>منشئ الفاتورة: ${invoice.creatorName} (${invoice.creatorId})</p>
            </div>
    
            <script>
                setTimeout(() => {
                    window.print();
                    window.close();
                }, 500);
            </script>
        </body>
        </html>
        `);
        printWindow.document.close();
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceNumber.includes(searchQuery)
    );

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 text-gray-800">
                <div className="m-auto text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4">جاري تحميل البيانات...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <header className="bg-white border-b border-gray-200 px-4 h-16 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">فواتير الشراء</h2>
                {/* logo */}
                <div className="flex items-center p-0">
                    <img src="/logo1.png" alt="Logo" className="h-20 w-20 " />
                </div>
            </header>
            <div className="container mx-auto p-4 min-h-screen text-gray-800 mb-12">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">فواتير الشراء</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 tooltip ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            <span className="tooltip-content text-white h-8 flex items-center justify-center w-34">عرض قائمة الفواتير</span>
                            <List size={18} /> قائمة الفواتير
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 tooltip ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            <span className="tooltip-content text-white h-8 flex items-center justify-center w-34">إنشاء فاتورة جديدة</span>
                            <PlusCircle size={18} /> إنشاء فاتورة
                        </button>
                    </div>
                </div>

                {activeTab === 'list' ? (
                    <>
                        <div className="bg-white rounded-lg shadow p-4 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="relative w-full max-w-md">
                                    <Search className="absolute right-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="ابحث باسم المورد أو رقم الفاتورة..."
                                        className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900 pl-10 pr-4"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className='text-gray-800'>
                                        <tr>
                                            <th>رقم الفاتورة</th>
                                            <th>المورد</th>
                                            <th>منشئ الفاتورة</th>
                                            <th>رقم المنشئ</th>
                                            <th>عدد المنتجات</th>
                                            <th>المجموع</th>
                                            <th>التاريخ</th>
                                            <th>الحالة</th>
                                            <th>إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInvoices.map((invoice) => (
                                            <tr key={invoice._id}>
                                                <td className="font-bold">#{invoice.invoiceNumber}</td>
                                                <td>{invoice.supplier.name}</td>
                                                <td>{invoice.creatorName}</td>
                                                <td>{invoice.creatorId}</td>
                                                <td>{invoice.products.length}</td>
                                                <td>{invoice.totalAmount.toLocaleString()} ج.م</td>
                                                <td>{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</td>
                                                <td>
                                                    <span className={`badge ${invoice.status === 'مكتمل' ? 'badge-success' : invoice.status === 'مسودة' ? 'badge-warning' : 'badge-error'}`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="flex gap-2">
                                                    <button
                                                        className="btn btn-sm btn-success text-white tooltip"
                                                        onClick={() => handlePrintInvoice(invoice)}
                                                    >
                                                        <span className="tooltip-content text-white h-8 flex items-center justify-center w-28">طباعة الفاتورة</span>
                                                        <Printer size={16} />
                                                    </button>
                                                    <button className="btn btn-sm btn-outline bg-blue-600 border-none text-white tooltip" onClick={() => handleEditInvoice(invoice)}>
                                                        <span className="tooltip-content text-white h-8 flex items-center justify-center w-28">تعديل الفاتورة</span>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn btn-sm btn-outline text-red-500" onClick={() => handleDeleteInvoice(invoice._id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4 cursor-pointer">{editingInvoice ? 'تعديل فاتورة شراء' : 'إنشاء فاتورة شراء'}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block mb-2 font-medium">اسم المورد</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                        value={formData.supplier.name}
                                        placeholder='اسم المورد'
                                        onChange={(e) => setFormData({ ...formData, supplier: { ...formData.supplier, name: e.target.value } })}
                                        list="supplierNames"
                                    />
                                    <datalist id="supplierNames">
                                        {invoices.map((invoice) => (
                                            <option key={invoice._id} value={invoice.supplier.name} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium">هاتف المورد</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                        value={formData.supplier.phone}
                                        placeholder='هاتف المورد'
                                        onChange={(e) => setFormData({ ...formData, supplier: { ...formData.supplier, phone: e.target.value } })}
                                        list="supplierPhones"
                                    />
                                    <datalist id="supplierPhones">
                                        {invoices.map((invoice) => (
                                            <option key={invoice._id} value={invoice.supplier.phone} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-2 font-medium">عنوان المورد</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                        value={formData.supplier.address}
                                        placeholder='عنوان المورد'
                                        onChange={(e) => setFormData({ ...formData, supplier: { ...formData.supplier, address: e.target.value } })}
                                        list="supplierAddresses"
                                    />
                                    <datalist id="supplierAddresses">
                                        {invoices.map((invoice) => (
                                            <option key={invoice._id} value={invoice.supplier.address} />
                                        ))}
                                    </datalist>
                                </div>
                                {/* Creator Details */}
                                <div>
                                    <label className="block mb-2 font-medium">اسم منشئ الفاتورة</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                        value={formData.creatorName}
                                        placeholder='اسم منشئ الفاتورة'
                                        onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                                        list="creatorNames"
                                        required
                                    />
                                    <datalist id="creatorNames">
                                        {invoices.map((invoice) => (
                                            <option key={invoice._id} value={invoice.creatorName} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium">رقم منشئ الفاتورة</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                        value={formData.creatorId}
                                        placeholder='رقم منشئ الفاتورة'
                                        onChange={(e) => setFormData({ ...formData, creatorId: e.target.value })}
                                        list="creatorIds"
                                        required
                                    />
                                    <datalist id="creatorIds">
                                        {invoices.map((invoice) => (
                                            <option key={invoice._id} value={invoice.creatorId} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                            {/* Product Addition */}
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-bold mb-4">إضافة منتجات</h3>
                                <div className="grid grid-cols-12 gap-2 mb-4">
                                    <div className="col-span-5">
                                        <label className='label my-2' htmlFor="اسم المنتج">
                                            <span className='label-text text-gray-700 font-bold'>اسم المنتج</span>
                                        </label>
                                        <input
                                            id='اسم المنتج'
                                            type="text"
                                            placeholder="اسم المنتج"
                                            className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                            value={currentProduct.name}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className='label my-2' htmlFor="الكمية">
                                            <span className='label-text text-gray-700 font-bold'>الكمية</span>
                                        </label>
                                        <input
                                            id='الكمية'
                                            type="number"
                                            placeholder="الكمية"
                                            className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                            value={currentProduct.quantity}
                                            onChange={(e) => {
                                                const quantity = parseInt(e.target.value) || 0;
                                                setCurrentProduct({
                                                    ...currentProduct,
                                                    quantity,
                                                    total: quantity * currentProduct.purchasePrice
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className='label my-2' htmlFor="سعر الشراء">
                                            <span className='label-text text-gray-700 font-bold'>سعر الشراء</span>
                                        </label>
                                        <input
                                            id='سعر الشراء'
                                            type="number"
                                            placeholder="سعر الشراء"
                                            className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                            value={currentProduct.purchasePrice}
                                            onChange={(e) => {
                                                const price = parseFloat(e.target.value) || 0;
                                                setCurrentProduct({
                                                    ...currentProduct,
                                                    purchasePrice: price,
                                                    total: currentProduct.quantity * price
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className='label my-2' htmlFor="المجموع">
                                            <span className='label-text text-gray-700 font-bold'>المجموع</span>
                                        </label>
                                        <input
                                            id='المجموع'
                                            type="number"
                                            placeholder="المجموع"
                                            className="input input-bordered w-full bg-transparent border-gray-400 text-gray-900"
                                            value={currentProduct.total}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center mt-10">
                                        <button
                                            onClick={handleAddProduct}
                                            className="btn p-2 bg-blue-600 border-0 w-full"
                                        >
                                            <PlusCircle className='w-6 h-6' />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr className='text-gray-800 border-gray-500'>
                                                <th>المنتج</th>
                                                <th>الكمية</th>
                                                <th>سعر الشراء</th>
                                                <th>المجموع</th>
                                                <th>حذف</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.products.map((product, index) => (
                                                <tr key={index}>
                                                    <td>{product.name}</td>
                                                    <td>{product.quantity}</td>
                                                    <td>{product.purchasePrice.toLocaleString()} ج.م</td>
                                                    <td>{product.total.toLocaleString()} ج.م</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-ghost text-red-500"
                                                            onClick={() => {
                                                                const updatedProducts = formData.products.filter((_, i) => i !== index);
                                                                const subtotal = updatedProducts.reduce((sum, p) => sum + p.total, 0);
                                                                setFormData({
                                                                    ...formData,
                                                                    products: updatedProducts,
                                                                    subtotal,
                                                                    totalAmount: subtotal + formData.tax - formData.discount
                                                                });
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        {/* Invoice Summary */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4">ملخص الفاتورة</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span>عدد المنتجات:</span>
                                    <span className="font-bold">{formData.products.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>المجموع الفرعي:</span>
                                    <span className="font-bold">{formData.subtotal.toLocaleString()} ج.م</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>الضريبة:</span>
                                    <input
                                        type="number"
                                        className="input input-bordered border-gray-400 bg-transparent w-34 text-center"
                                        value={formData.tax}
                                        onChange={(e) => {
                                            const tax = parseFloat(e.target.value) || 0;
                                            setFormData({
                                                ...formData,
                                                tax,
                                                totalAmount: formData.subtotal + tax - formData.discount
                                            });
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <span>الخصم:</span>
                                    <input
                                        type="number"
                                        className="input input-bordered border-gray-400 bg-transparent w-34 text-center"
                                        value={formData.discount}
                                        onChange={(e) => {
                                            const discount = parseFloat(e.target.value) || 0;
                                            setFormData({
                                                ...formData,
                                                discount,
                                                totalAmount: formData.subtotal + formData.tax - discount
                                            });
                                        }}
                                    />
                                </div>
                                <div className="divider"></div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>المجموع النهائي:</span>
                                    <span>{formData.totalAmount.toLocaleString()} ج.م</span>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block mb-2 font-medium">طريقة الدفع</label>
                                <select
                                    className="select select-bordered w-full border-gray-400 bg-transparent cursor-pointer"
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                >
                                    <option value="نقدي">نقدي</option>
                                    <option value="آجل">آجل</option>
                                    <option value="تحويل بنكي">تحويل بنكي</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block mb-2 font-medium">ملاحظات</label>
                                <textarea
                                    className="textarea textarea-bordered w-full border-gray-400 bg-transparent"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={resetForm}
                                    className="btn btn-outline flex-1 gap-2"
                                >
                                    <XCircle className='w-5 h-6' /> إلغاء
                                </button>
                                <button
                                    onClick={handleSubmitInvoice}
                                    className="btn bg-blue-600 border-0 flex"
                                    disabled={formData.products.length === 0 || !formData.supplier.name}
                                >
                                    <Save className='w-5 h-6' /> {editingInvoice ? 'تحديث الفاتورة' : 'حفظ الفاتورة'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className='flex items-center justify-center my-5 tooltip ' >
                    <p className='tooltip-content text-white h-8 flex items-center justify-center w-28'>الصفحة الرئيسية</p>
                    <Link href="/" className="btn bg-blue-600 border-0 w-34 hover:bg-blue-600/95 rounded-full p-3">
                        <Home className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </>
    );
}