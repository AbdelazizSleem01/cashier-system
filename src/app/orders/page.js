'use client'
import { useEffect, useState } from 'react';
import { FileText, Calendar, User, Phone, ShoppingBasket, Home, Search, Trash, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                const data = await response.json();
                setOrders(Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : []));
            } catch (error) {
                console.error('Error fetching orders:', error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);


    // Delete order
    const deleteOrder = async (orderId) => {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: 'لن تتمكن من استعادة الفاتورة بعد الحذف!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذفها!',
            cancelButtonText: 'إلغاء',
            reverseButtons: true
        });
    
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'DELETE'
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setOrders(orders.filter(order => order._id !== orderId));
                    Swal.fire('تم حذف الفاتورة بنجاح', '', 'success');
                } else {
                    const errorData = await response.json();
                    Swal.fire('خطأ!', errorData.error || 'حدث خطأ أثناء حذف الفاتورة', 'error');
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                Swal.fire('خطأ!', 'حدث خطأ غير متوقع أثناء حذف الفاتورة', 'error');
            }
        }
    };

    const filteredOrders = Array.isArray(orders) ? orders.filter(order =>
        order?.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order?.customerPhone?.includes(searchQuery) ||
        order?._id?.includes(searchQuery)
    ) : [];

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
        <div className="min-h-screen bg-gray-50 p-4 mb-10 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                                <FileText className="h-6 w-6 text-blue-600" />
                                <span>سجل الفواتير</span>
                            </h1>
                        </div>
                        <p className="text-gray-600 mt-2">إدارة الفواتير المسجلة في النظام</p>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="...ابحث عن فاتورة بإسم العميل"
                            className="input border-gray-500 text-gray-800 w-full pl-10 pr-4 bg-transparent "
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Orders Table */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                            {searchQuery ? 'لا توجد نتائج' : 'لا توجد فواتير مسجلة بعد'}
                        </h3>
                        <p className="text-gray-500">
                            {searchQuery ? 'جرب بحثًا مختلفًا' : 'سيظهر هنا الفواتير بعد إنشائها'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">المنتجات</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">المجموع</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">اسم العميل</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">رقم العميل</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الإجرأت</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                                                    #{order._id?.slice(-6)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col gap-2">
                                                    {Array.isArray(order.products) && order.products.map((product, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <ShoppingBasket className="h-4 w-4 text-blue-500" />
                                                            <span>
                                                                {product.name}
                                                                <span className="text-gray-400 mx-1">×</span>
                                                                <span className="font-medium">{product.quantity}</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.totalAmount?.toFixed(2)} ج.م
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4 text-green-500" />
                                                    <span>{order.customerName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                <Phone className="h-4 w-4 text-green-500" />
                                                <span>{order.customerPhone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-purple-500" />
                                                    <span>{new Date(order.createdAt).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => deleteOrder(order._id)}
                                                    className="text-red-600 hover:text-red-800 btn w-8 h-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stats */}
                {orders.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500">إجمالي الفواتير</p>
                            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500">إجمالي المبيعات</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)} ج.م
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500">متوسط الفاتورة</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {(orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length).toFixed(2)} ج.م
                            </p>
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
        </div>
    );
}