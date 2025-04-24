'use client'
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBasket, Printer, Trash2, Plus, Minus, X, Heart, Check, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

const InvoiceTemplate = React.forwardRef((props, ref) => {

    const [storeInfo, setStoreInfo] = useState({
        name: 'متجرنا',
        address: 'العنوان: مدينة، شارع، مبنى',
        phone: '01119268163',
        logo: '/logo1.png'
    });

    useEffect(() => {
        const savedStoreInfo = localStorage.getItem('storeInfo');
        if (savedStoreInfo) {
            setStoreInfo(JSON.parse(savedStoreInfo));
        }
    }, []);

    const {
        cartItems = [],
        total = 0,
        customer = { name: '', phone: '' },
        date = new Date().toLocaleDateString('ar-EG'),
        onClose,
        onPrint,
        onConfirm
    } = props;

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return (
        <div ref={ref} className="w-full max-w-2xl bg-white mb-18 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center print:hidden">
                <h2 className="text-xl font-bold">فاتورة بيع</h2>
                <div className="flex gap-2 buttons">
                    <button
                        onClick={onPrint}
                        className="p-2 bg-white text-blue-600 rounded hover:bg-gray-100"
                        title="طباعة الفاتورة"
                    >
                        <Printer className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white text-blue-600 rounded hover:bg-gray-100"
                        title="إغلاق"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto p-6 font-sans print:p-2">
                <header className="text-center mb-6 border-b pb-6 print:border-none">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{storeInfo.name}</h1>
                    <div className="text-gray-600 space-y-1 text-sm">
                        <p>{storeInfo.address}</p>
                        <p>تليفون: {storeInfo.phone}</p>
                        <p className="text-gray-500 mt-2">تاريخ الفاتورة: {date}</p>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">
                            <span className="text-blue-600">#{invoiceNumber}</span> : رقم الفاتورة
                        </p>
                    </div>
                    {/* logo */}
                    {storeInfo.logo && (
                        <div className="flex justify-center mt-4">
                            <img
                                src={storeInfo.logo}
                                alt="شعار المتجر"
                                className="h-16 object-contain"
                            />
                        </div>
                    )}
                </header>

                <section className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 print:border-none print:bg-white">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">معلومات العميل</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600 mb-1">الاسم:</span>
                            <span className="bg-white p-2 rounded border text-gray-600 border-gray-200 print:border-none">
                                {customer.name || 'غير محدد'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-600 mb-1">الهاتف:</span>
                            <span className="bg-white p-2 rounded border text-gray-600 border-gray-200 print:border-none">
                                {customer.phone || 'غير محدد'}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-right print:bg-gray-200">
                                    <th className="py-3 px-4 font-semibold text-gray-700 border">المنتج</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 border">الكمية</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 border">السعر</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700 border">المجموع</th>

                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item, index) => (
                                    <tr
                                        key={`${item._id}-${index}`}
                                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 print:bg-gray-100'}
                                    >
                                        <td className="py-3 px-4 border text-gray-700 text-right">{item.name}</td>
                                        <td className="py-3 px-4 border text-gray-700 text-center">{item.quantity}</td>
                                        <td className="py-3 px-4 border text-gray-700 text-left">{item.price.toFixed(2)} ج.م</td>
                                        <td className="py-3 px-4 border text-gray-700 text-left font-medium">{(item.price * item.quantity).toFixed(2)} ج.م</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-6">
                    <div className="flex justify-end">
                        <div className="w-full md:w-64 border border-gray-200 rounded-lg overflow-hidden print:border-black">
                            <div className="flex justify-between p-3 border-b text-gray-700 bg-gray-50 print:bg-gray-200 print:border-black">
                                <span>{total.toFixed(2)} ج.م</span>
                                <span className="font-medium text-gray-700">:الإجمالي</span>
                            </div>
                            <div className="flex justify-between p-3 border-b print:border-black text-gray-700">
                                <span>0.00 ج.م</span>
                                <span className="font-medium">:الخصم</span>
                            </div>
                            <div className="flex justify-between p-3 border-b print:border-black text-gray-700">
                                <span>0.00 ج.م</span>
                                <span className="font-medium">:الضريبة</span>
                            </div>
                            <div className="flex justify-between p-3 bg-blue-50 text-blue-700 font-bold print:bg-gray-200 print:border-t-2 print:border-black">
                                <span>{total.toFixed(2)} ج.م</span>
                                <span>:المبلغ المستحق</span>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500 print:border-black">
                    <div className="flex items-center justify-center mb-2">
                        <Heart className="h-4 w-4 text-red-500 mr-1" />
                        <span>شكرًا لتعاملكم معنا</span>
                    </div>
                    <p>للاستفسار يرجى الاتصال على: {storeInfo.phone}</p>
                    <p className="mt-2">هذه الفاتورة صادرة من نظام {storeInfo.name}</p>
                </footer>
            </div>

            <div className="p-4 border-t bg-gray-50 print:hidden">
                <div className="flex gap-4 buttons">
                    <button
                        onClick={onClose}
                        className="btn btn-neutral  flex-1"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn btn-success flex-1"
                    >
                        <Check className="mr-1" /> تأكيد الطلب
                    </button>
                </div>
            </div>
        </div>
    );
});

InvoiceTemplate.displayName = "InvoiceTemplate";

export default function CartPage() {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [showInvoice, setShowInvoice] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
    const [products, setProducts] = useState([]); // قائمة المنتجات من الخادم
    const invoiceRef = useRef();
    const router = useRouter();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartWithIds = savedCart.map(item => ({
            ...item,
            cartItemId: item.cartItemId || `${item._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
        setCart(cartWithIds);
        calculateTotal(cartWithIds);
    }, []);

    const calculateTotal = (cartItems) => {
        const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(totalAmount);
    };

    const handleRemoveItem = (cartItemId) => {
        const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        calculateTotal(updatedCart);
    };

    const handleQuantityChange = (cartItemId, newQuantity) => {
        const quantity = Math.max(1, parseInt(newQuantity) || 1);
        const updatedCart = cart.map(item =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
        );
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        calculateTotal(updatedCart);
    };

    const handleShowInvoice = async () => {
        if (cart.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: '<span class="text-2xl text-amber-600">سلة التسوق فارغة</span>',
                html: `
                <div class="text-right text-gray-700">
                    <div class="flex items-center gap-3 justify-end">
                        <svg class="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <p class="text-lg">الرجاء إضافة منتجات قبل معاينة الفاتورة</p>
                    </div>
                </div>
            `,
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#3B82F6',
                background: '#fff',
                customClass: {
                    popup: 'rounded-2xl shadow-xl',
                    title: 'mb-4'
                }
            });
            return;
        }

        try {
            const response = await fetch("/api/customers");
            const { names, phones } = await response.json();

            const { value: formValues } = await Swal.fire({
                title: '<span class="text-2xl text-gray-800">بيانات العميل</span>',
                html: `
                <div class="text-right space-y-4">
                    <div>
                        <label class="block text-sm text-gray-600 mb-2">اسم العميل</label>
                        <div class="relative">
                            <input 
                                id="swal-input1" 
                                class="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="أدخل اسم العميل"
                                list="customerName"
                            >
                            <div class="absolute left-3 top-3 text-gray-400">
                                <svg class="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                            </div>
                        </div>
                        <datalist id="customerName" class="bg-white rounded-lg shadow-lg max-h-40 overflow-auto">
                            ${names.map(name => `
                                <option value="${name}" class="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                                    ${name}
                                </option>
                            `).join("")}
                        </datalist>
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600 mb-2">رقم الهاتف</label>
                        <div class="relative">
                            <input 
                                id="swal-input2" 
                                class="w-full px-4 py-3 rounded-lg pl-10  border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="أدخل رقم الهاتف"
                                list="customerPhone"
                            >
                            <div class="absolute left-3 top-3 text-gray-400">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                            </div>
                        </div>
                        <datalist id="customerPhone" class="bg-white rounded-lg shadow-lg max-h-40 overflow-auto">
                            ${phones.map(phone => `
                                <option value="${phone}" class="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                                    ${phone}
                                </option>
                            `).join("")}
                        </datalist>
                    </div>
                </div>
            `,
                focusConfirm: false,
                confirmButtonText: 'استمرار',
                cancelButtonText: 'إلغاء',
                showCancelButton: true,
                confirmButtonColor: '#3B82F6',
                cancelButtonColor: '#ef4444',
                background: '#fff',
                customClass: {
                    popup: 'rounded-2xl shadow-xl p-6',
                    title: 'mb-6',
                    input: 'my-2',
                    actions: 'mt-6'
                },
                preConfirm: () => {
                    return {
                        name: document.getElementById("swal-input1").value,
                        phone: document.getElementById("swal-input2").value
                    };
                }
            });

            if (formValues) {
                setCustomerInfo({
                    name: formValues.name,
                    phone: formValues.phone
                });
                setShowInvoice(true);
            }
        } catch (error) {
            console.error("Error fetching customer suggestions:", error);
            Swal.fire({
                icon: 'error',
                title: '<span class="text-2xl text-red-600">خطأ</span>',
                html: `
                <div class="text-right text-gray-700">
                    <div class="flex items-center gap-3 justify-end">
                        <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p class="text-lg">حدث خطأ أثناء جلب بيانات العملاء</p>
                    </div>
                </div>
            `,
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#3B82F6',
                background: '#fff',
                customClass: {
                    popup: 'rounded-2xl shadow-xl'
                }
            });
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const invoiceContent = invoiceRef.current.innerHTML;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <title>فاتورة بيع</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        padding: 20px;
                        color: #333;
                    }
                        .buttons{
                        display:none;
                        }
                    .invoice-container {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: right;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .text-left { text-align: left; }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    ${invoiceContent}
                </div>
                <script>
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 200);
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleCompleteOrder = async () => {
        try {
            const orderData = {
                products: cart.map(item => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: total,
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}` // إضافة رقم الفاتورة هنا
            };
            console.log("Sending order data:", orderData);
    
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
    
            if (response.ok) {
                setCart([]);
                localStorage.removeItem('cart');
                Swal.fire({
                    icon: 'success',
                    title: 'تمت العملية بنجاح',
                    text: 'تم حفظ الفاتورة بنجاح'
                });
                router.push('/orders');
            }
        } catch (error) {
            console.error('Error saving order:', error);
            Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: 'حدث خطأ أثناء حفظ الفاتورة'
            });
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 mb-10">
            {/* Sidebar */}
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden ">
                <header className="bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800">سلة التسوق</h2>
                    <div className='flex items-center justify-center '>
                        <Link href="/" className="btn bg-blue-600 border-0 w-24 hover:bg-blue-600/95 rounded-full p-3">
                            <Home className="h-5 w-5" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-800">عدد المنتجات: <span className="text-blue-600">{cart.length}</span></span>
                    </div>
                </header>

                {/* Cart Items */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow p-8">
                            <ShoppingBasket className="h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-lg text-gray-600 mb-2">سلة التسوق فارغة</p>
                            <p className="text-gray-500 mb-6">لم تقم بإضافة أي منتجات بعد</p>
                            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium">
                                تصفح المنتجات
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.cartItemId} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                                            <button
                                                onClick={() => handleRemoveItem(item.cartItemId)}
                                                className="text-white btn p-0 h-8 w-8 bg-red-600 hover:bg-red-600/80 border-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-blue-600 font-medium">{item.price.toFixed(2)} ج.م/الوحدة</span>
                                            <span className="font-bold text-gray-800">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                <button
                                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                    onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    min="1"
                                                    onChange={(e) => handleQuantityChange(item.cartItemId, e.target.value)}
                                                    className="w-12 pl-4 text-center border-0 focus:ring-0 text-gray-800"
                                                />
                                                <button
                                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                    onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* Total and Actions */}
                {cart.length > 0 && (
                    <div className="px-4 py-5  border-t border-gray-200 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div >
                                <button
                                    className="w-full btn border-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium"
                                    onClick={handleShowInvoice}
                                    disabled={cart.length === 0}
                                >
                                    <Printer className="h-5 w-5" />
                                    عرض الفاتورة
                                </button>
                            </div>
                            <div className='flex items-center gap-2'>

                                <span className="text-2xl font-bold text-blue-600">ج.م  </span>
                                <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)} </span>
                                <h3 className="text-xl font-bold text-gray-800 ">: المجموع الكلي</h3>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Modal */}
            {showInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <InvoiceTemplate
                        ref={invoiceRef}
                        cartItems={cart}
                        total={total}
                        customer={customerInfo}
                        onClose={() => setShowInvoice(false)}
                        onPrint={handlePrint}
                        onConfirm={handleCompleteOrder}
                    />
                </div>
            )}
        </div>
    );
}