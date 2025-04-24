'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { User, Phone, ListOrdered, Search, Edit, Trash2, PlusCircle, Home, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [names, setNames] = useState([]);
    const [phones, setPhones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch("/api/customers");
            const data = await response.json();

            if (response.ok) {
                setCustomers(data.customers);
                setNames(data.names);
                setPhones(data.phones);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "خطأ",
                    text: data.error || "حدث خطأ أثناء جلب بيانات العملاء"
                });
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
            Swal.fire({
                icon: "error",
                title: "خطأ",
                text: "حدث خطأ غير متوقع أثناء جلب بيانات العملاء"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'إضافة عميل جديد',
            html: `
        <input id="swal-input-name" class="swal2-input" placeholder="اسم العميل">
        <input id="swal-input-phone" class="swal2-input" placeholder="رقم الهاتف">
      `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'إضافة',
            cancelButtonText: 'إلغاء',
            preConfirm: () => {
                const name = document.getElementById('swal-input-name').value;
                const phone = document.getElementById('swal-input-phone').value;

                if (!name || !phone) {
                    Swal.showValidationMessage('يرجى تعبئة جميع الحقول');
                    return false;
                }

                return { name, phone };
            }
        });

        if (formValues) {
            try {
                const response = await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValues)
                });

                if (response.ok) {
                    Swal.fire('نجاح!', 'تم إضافة العميل بنجاح.', 'success');
                    fetchCustomers(); // Refresh the list of customers
                } else {
                    const errorData = await response.json();
                    Swal.fire('خطأ!', errorData.error || 'حدث خطأ أثناء إضافة العميل', 'error');
                }
            } catch (error) {
                Swal.fire('خطأ!', 'حدث خطأ غير متوقع', 'error');
            }
        }
    };

    const handleEditCustomer = async (customer) => {
        const result = await Swal.fire({
            title: 'تعديل بيانات العميل',
            html: `
            <input id="swal-input-name" class="swal2-input" placeholder="اسم العميل" value="${customer.name}">
            <input id="swal-input-phone" class="swal2-input" placeholder="رقم الهاتف" value="${customer.phone}">
          `,
            focusConfirm: false,
            preConfirm: () => {
                const newName = document.getElementById('swal-input-name').value;
                const newPhone = document.getElementById('swal-input-phone').value;
                if (!newName || !newPhone) {
                    Swal.showValidationMessage('يرجى تعبئة جميع الحقول');
                    return false;
                }
                return { name: customer.name, phone: customer.phone, newName, newPhone };
            }
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/customers', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                });

                if (response.ok) {
                    Swal.fire('نجاح!', 'تم تحديث بيانات العميل بنجاح.', 'success');
                    fetchCustomers(); // Refresh the list of customers
                } else {
                    const errorData = await response.json();
                    Swal.fire('خطأ!', errorData.error || 'حدث خطأ أثناء تحديث بيانات العميل', 'error');
                }
            } catch (error) {
                Swal.fire('خطأ!', 'حدث خطأ غير متوقع', 'error');
            }
        }
    };

    const handleDeleteCustomer = async (customer) => {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: 'لن تتمكن من استعادة بيانات العميل بعد الحذف!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذفه!',
            cancelButtonText: 'إلغاء',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/api/customers', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: customer.name, phone: customer.phone })
                });

                if (response.ok) {
                    Swal.fire('تم الحذف!', 'تم حذف العميل بنجاح.', 'success');
                    fetchCustomers(); // Refresh the list of customers
                } else {
                    const errorData = await response.json();
                    Swal.fire('خطأ!', errorData.error || 'حدث خطأ أثناء حذف العميل', 'error');
                }
            } catch (error) {
                Swal.fire('خطأ!', 'حدث خطأ غير متوقع', 'error');
            }
        }
    };

    const filteredCustomers = Array.isArray(customers)
        ? customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.phone.includes(searchQuery)
        )
        : [];

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
        <div className="container mx-auto p-12   min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">قائمة العملاء</h1>

                <button
                    onClick={handleAddCustomer}
                    className="btn btn-primary bg-blue-600 flex items-center gap-2"
                >
                    <PlusCircle size={18} />
                    إضافة عميل جديد
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute right-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ابحث باسم العميل أو رقم الهاتف..."
                        className="input input-bordered w-full bg-transparent border-gray-300 text-gray-900 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto text-gray-800">
                <table className="table w-full">
                    <thead>
                        <tr className="text-gray-700 border-b border-gray-500">
                            <th>اسم العميل</th>
                            <th>رقم الهاتف</th>
                            <th>عدد الطلبات</th>
                            <th>تاريخ التسجيل</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer, index) => (
                            <tr key={index}>
                                <td className="border-b border-gray-300">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className='text-success' />
                                        {customer.name}
                                    </div>
                                </td>
                                <td className="border-b border-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className='text-blue-600' />
                                        {customer.phone}
                                    </div>
                                </td>
                                <td className="border-b border-gray-300">
                                    <div className="flex items-center gap-2">
                                        <ListOrdered size={16} className='text-yellow-600' />
                                        {customer.orderCount}
                                    </div>
                                </td>
                                <td className="border-b border-gray-300">
                                    <div className="flex flex-col gap-5">
                                        {customer.orders && customer.orders.length > 0 ? (
                                            customer.orders.map((order, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {new Date(order.createdAt).toLocaleString('ar-EG')}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500">لا توجد طلبات</div>
                                        )}
                                    </div>
                                </td>
                                <td className="border-b border-gray-300">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditCustomer(customer)}
                                            className="btn btn-sm btn-outline btn-info"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCustomer(customer)}
                                            className="btn btn-sm btn-outline btn-error"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='flex items-center justify-center my-5'>
                <Link href="/" className="btn bg-blue-600 border-0 w-42 hover:bg-blue-600/95 rounded-full p-3">
                    <Home className="h-5 w-5" />
                </Link>
            </div>
        </div>
    );
}