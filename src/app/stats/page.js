'use client'
import { Package, Users, ShoppingBasket, Clock, Home } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StatsPage() {
    const [products, setProducts] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        inventory: { available: 0, lowStock: 0, outOfStock: 0 },
        sales: { total: 0, monthlyChange: 0, daily: [] },
        customers: { total: 0, new: 0, existing: 0 }
    });

    const [loading, setLoading] = useState(true);

    const calculateMonthlyChange = (orders) => {
        const validOrders = Array.isArray(orders) ? orders : [];

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Safely filter and calculate
        const currentMonthSales = validOrders
            .filter(order => order?.createdAt && new Date(order.createdAt) >= currentMonthStart)
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const lastMonthSales = validOrders
            .filter(order => order?.createdAt &&
                new Date(order.createdAt) >= lastMonthStart &&
                new Date(order.createdAt) <= lastMonthEnd)
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        if (lastMonthSales === 0) return currentMonthSales > 0 ? 100 : 0;
        return Math.round(((currentMonthSales - lastMonthSales) / lastMonthSales) * 100);
    };
    const calculateDashboardData = (products, orders) => {
        const validOrders = Array.isArray(orders) ? orders : [];

        const totalProducts = products.length || 1;
        const available = products.filter(p => p?.quantity > 10).length;
        const lowStock = products.filter(p => p?.quantity > 0 && p?.quantity <= 10).length;
        const outOfStock = products.filter(p => p?.quantity <= 0).length;


        const totalSales = validOrders.reduce((sum, order) => sum + (order?.totalAmount || 0), 0);


        const customerMap = new Map();
        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const currentMonth = now.getUTCMonth();
        const currentMonthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
        const dailySales = {};
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);


        validOrders.forEach(order => {

            const orderDate = new Date(order.createdAt);
            if (orderDate > oneMonthAgo) {
                const dateKey = orderDate.toISOString().split('T')[0];
                dailySales[dateKey] = (dailySales[dateKey] || 0) + (order.totalAmount || 0);
            }
            if (order?.customerPhone) {
                if (!customerMap.has(order.customerPhone)) {
                    // Parse createdAt as UTC date
                    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
                    const utcDate = new Date(Date.UTC(
                        createdAt.getUTCFullYear(),
                        createdAt.getUTCMonth(),
                        createdAt.getUTCDate(),
                        createdAt.getUTCHours(),
                        createdAt.getUTCMinutes(),
                        createdAt.getUTCSeconds()
                    ));

                    customerMap.set(order.customerPhone, {
                        firstOrderDate: utcDate,
                        orderCount: 0
                    });
                }
                customerMap.get(order.customerPhone).orderCount++;
            }
        });

        let newCustomers = 0;
        let existingCustomers = 0;

        const dailySalesArray = Object.entries(dailySales)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        customerMap.forEach(customer => {
            if (customer.firstOrderDate >= currentMonthStart) {
                newCustomers++;
            } else {
                existingCustomers++;
            }
        });

        setDashboardData({
            inventory: {
                available: Math.round((available / totalProducts) * 100),
                lowStock: Math.round((lowStock / totalProducts) * 100),
                outOfStock: Math.round((outOfStock / totalProducts) * 100)
            },
            sales: {
                total: totalSales,
                monthlyChange: calculateMonthlyChange(validOrders)
            },
            customers: {
                total: customerMap.size,
                new: newCustomers,
                existing: existingCustomers
            },
            sales: {
                total: totalSales,
                monthlyChange: calculateMonthlyChange(validOrders),
                daily: dailySalesArray
            }
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/orders')
                ]);

                const productsData = await productsRes.json();
                let ordersData = await ordersRes.json();
                setProducts(productsData);
                calculateDashboardData(productsData, ordersData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                {/* logo */}
                <div className="flex items-center p-0">
                    <img src="/logo1.png" alt="Logo" className="h-20 w-20 " />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">الإحصائيــات</h2>
            </header>
            <div className="flex-1 overflow-y-auto p-4 mb-14 text-gray-900">
                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
                    {/* Inventory Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-lg mb-4">حالة المخزون</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span>المنتجات المتاحة</span>
                                    <span>{dashboardData.inventory.available}%</span>
                                </div>
                                <progress
                                    className="progress progress-primary w-full"
                                    value={dashboardData.inventory.available}
                                    max="100"
                                ></progress>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span>المنتجات قاربة النفاد</span>
                                    <span>{dashboardData.inventory.lowStock}%</span>
                                </div>
                                <progress
                                    className="progress progress-warning w-full"
                                    value={dashboardData.inventory.lowStock}
                                    max="100"
                                ></progress>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span>المنتجات المنتهية</span>
                                    <span>{dashboardData.inventory.outOfStock}%</span>
                                </div>
                                <progress
                                    className="progress progress-error w-full"
                                    value={dashboardData.inventory.outOfStock}
                                    max="100"
                                ></progress>
                            </div>
                        </div>
                    </div>

                    {/* Sales Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                        <h3 className="font-semibold text-lg mb-4">إحصائيات المبيعات</h3>
                        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">
                                    {dashboardData.sales.total.toLocaleString()} ج.م
                                </div>
                                <p className={`mt-2 text-lg ${dashboardData.sales.monthlyChange >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    {dashboardData.sales.monthlyChange >= 0 ? '↑' : '↓'}
                                    {Math.abs(dashboardData.sales.monthlyChange)}% عن الشهر الماضي
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sales Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                    <h3 className="font-semibold text-lg mb-4">إحصائيات المبيعات</h3>
                    <div className="h-64 overflow-y-auto">
                        {dashboardData.sales.daily.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">لا توجد مبيعات في آخر 30 يومًا</p>
                            </div>
                        ) : (
                            <div className="space-y-4 p-4">
                                {dashboardData.sales.daily.map((day) => (
                                    <div key={day.date} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">
                                                {new Date(day.date).toLocaleDateString('ar-EG', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                {day.total.toLocaleString()} ج.م
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                                                style={{ width: `${(day.total / dashboardData.sales.total * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* Quick Stats */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 my-6">
                    <h3 className="font-semibold text-lg mb-4">إحصائيات سريعة</h3>
                    <div className="stats stats-vertical lg:stats-horizontal shadow-lg w-full">
                        <div className="stat border-1 rounded-2xl border-gray-200">
                            <div className="stat-figure text-primary">
                                <ShoppingBasket className="h-8 w-8" />
                            </div>
                            <div className="stat-title text-gray-700">إجمالي المبيعات</div>
                            <div className="stat-value">{dashboardData.sales.total.toLocaleString()} ج.م</div>
                            <div className="stat-desc text-success">
                                {dashboardData.sales.monthlyChange >= 0 ? 'زيادة' : <p className='text-red-700'> انخفاض</p>}
                                {' '}بـ {Math.abs(dashboardData.sales.monthlyChange)}%
                            </div>
                        </div>

                        <div className="stat border-1 rounded-2xl border-gray-200">
                            <div className="stat-figure text-secondary">
                                <Package className="h-8 w-8" />
                            </div>
                            <div className="stat-title text-gray-700">المنتجات</div>
                            <div className="stat-value">{products.length.toLocaleString()}</div>
                            <div className="stat-desc text-success">
                                {dashboardData.inventory.lowStock > 0
                                    ? <p className="text-error"> ${dashboardData.inventory.lowStock}% قاربة النفاد </p>
                                    : 'المخزون جيد'}
                            </div>
                        </div>

                        <div className="stat border-1 rounded-2xl border-gray-200">
                            <div className="stat-figure text-accent">
                                <Users className="h-8 w-8" />
                            </div>
                            <div className="stat-title">العملاء</div>
                            <div className="stat-value">{dashboardData.customers.total.toLocaleString()}</div>
                            <div className="stat-desc">
                                <div className="flex justify-between">
                                    <span className="text-green-600">+{dashboardData.customers.new} عملاء جدد</span>
                                    <span className="text-blue-600">{dashboardData.customers.existing} موجودين</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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