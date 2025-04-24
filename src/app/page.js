'use client'
import { Package, Tags, Home, Users, PlusCircle, FileText, ShoppingCart, FileInput, ChartColumn, Settings, User2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allProducts, setAllProducts] = useState([]);
  const router = useRouter();



  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ]);

        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();

        if (Array.isArray(productsData)) {
          setProducts(productsData);
          setAllProducts(productsData);
        } else {
          console.error("Data fetched is not an array:", productsData);
        }

        setCategories(categoriesData);

        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (!categoryId) {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product =>
        product.category?._id === categoryId
      );
      setProducts(filtered);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders')
        ]);

        const productsData = await productsRes.json();
        let ordersData = [];

        // Safely handle orders response
        try {
          const ordersResponse = await ordersRes.json();
          ordersData = Array.isArray(ordersResponse)
            ? ordersResponse
            : (Array.isArray(ordersResponse?.orders)
              ? ordersResponse.orders
              : []);
        } catch (e) {
          console.error('Error parsing orders:', e);
          ordersData = [];
        }

        setProducts(productsData);

        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const addToCart = (product) => {
    if (product.quantity <= 0) return;

    const existingItem = cart.find(item => item._id === product._id);
    let updatedCart;

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert('لا يمكن إضافة كمية أكثر من المتاحة');
        return;
      }
      updatedCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };


  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

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
    <div className="flex h-screen bg-gray-50 text-gray-800 mb-14 ">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col ">
        <div className="p- border-b border-gray-200 pl-4">
          <div className="flex items-center space-x-2">
            <img src="/logo1.png" alt="Logo" className="h-16 w-16 p-0" />
            <h1 className="text-xl font-bold"> الكـاشيــر</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-600">
            <Home className="h-5 w-5" />
            <span>الصفحة الرئيسية</span>
          </button>
          <Link href={'/products'} className="w-full flex items-center gap-2 space-x-3 p-3 tooltip  rounded-lg hover:bg-gray-100">
            <p className='tooltip-content text-white h-8 flex items-center justify-center w-24'>المنتجــات</p>
            <Package className="h-5 w-5" />
            <span>المنتجات</span>
          </Link>
          <Link href={'/CartPage'} className="w-full flex items-center gap-2 space-x-3 p-3 rounded-lg tooltip hover:bg-gray-100">
            <p className='tooltip-content text-white h-8 flex items-center justify-center w-24'>السلــة</p>
            <ShoppingCart className="h-5 w-5" />
            <span>السلة</span>
            {cartItemCount > 0 && (
              <span className="ml-2 text-white bg-red-600 rounded-full px-2 py-[2px] text-xs">{cartItemCount}</span>
            )}
          </Link>
          <Link href={'/categories'} className="w-full flex items-center space-x-3 p-3 rounded-lg tooltip gap-2 hover:bg-gray-100">
            <p className='tooltip-content text-white h-8 flex items-center justify-center w-24'>الفئات</p>
            <Tags className="h-5 w-5" />
            <span>الفئات</span>
          </Link>
          <Link href={'/orders'} className="w-full flex items-center gap-2 space-x-3 p-3 rounded-lg tooltip hover:bg-gray-100">
            <p className='tooltip-content text-white h-8 flex items-center justify-center w-24'>الفواتير بيــع</p>
            <FileText className="h-5 w-5" />
            <span>فواتير بيــع</span>
          </Link>
          <Link href={'/PurchaseInvoice'} className="w-full flex items-center gap-2 space-x-3 p-3 rounded-lg tooltip hover:bg-gray-100">
            <p className='tooltip-content text-white h-8 flex items-center justify-center w-24'>فواتير شراء</p>
            <FileInput className="h-5 w-5" />
            <span>فواتير شراء</span>
          </Link>
          <Link href={'/customers'} className="w-full flex items-center gap-2 space-x-3 p-3 rounded-lg tooltip hover:bg-gray-100">
            <p className='tooltip-content text-white h-8 flex items-center justify-center w-24'>العملاء</p>
            <Users className="h-5 w-5" />
            <span>العملاء</span>
          </Link>
          <Link href={'/stats'} className="w-full flex items-center gap-2 space-x-3 p-3 rounded-lg tooltip hover:bg-gray-100">
            <p className='tooltip-content text-white h-8 flex items-center justify-center w-24'>احصائيــات</p>
            <ChartColumn className="h-5 w-5" />
            <span>احصائيــات</span>
          </Link>
          <Link href={'/settings'} className="w-full flex items-center gap-2 space-x-3 p-3 rounded-lg tooltip hover:bg-gray-100">
            <p className='tooltip-content text-white h-8 flex items-center justify-center w-26'>اعدادات المتجر</p>
            <Settings className="h-5 w-5" />
            <span>اعدادات المتجر</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link href={'/login'} className="w-full btn bg-green-700 border-0 gap-2 my-2">
            <User2 className="h-5 w-5" />
            صفحة التسجيل
          </Link>
          <Link href={'/PurchaseInvoice'} className="w-full btn bg-blue-700 border-0 gap-2">
            <PlusCircle className="h-5 w-5" />
            فاتورة جديدة
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 h-16 flex justify-between items-center">
          <h2 className="text-xl font-semibold">الصفحة الرئيسية</h2>
          {/* logo */}
          <div className="flex items-center p-0">
            <img src="/logo1.png" alt="Logo" className="h-20 w-20 " />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">تصفية حسب الفئة:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-full border transition-colors
                ${!selectedCategory
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                الكل
              </button>


              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category._id)}
                  className={`px-4 py-2 rounded-full border transition-colors btn tooltip
                    ${selectedCategory === category._id
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  {category.name}
                  <p className='tooltip-content text-white h-8 flex items-center justify-center w-24'>{category.name} فئــة</p>

                </button>
              ))}
            </div>
          </div>
          {/* Products Section */}
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">المنتجات</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {Array.isArray(products) && products.slice(0, 8).map((product) => {
                const cartItem = cart.find(item => item._id === product._id);
                const inCartQuantity = cartItem ? cartItem.quantity : 0;
                const isOutOfStock = product.quantity <= 0;

                return (
                  <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className="bg-gradient-to-br from-blue-50 to-gray-100 h-48 flex items-center justify-center">
                      <Package className="h-20 w-20 text-blue-400" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-gray-800 truncate " dir='rtl'>{product.name}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 mt-2 mr-2 rounded " >
                          {product.category?.name || 'عام'}
                        </span>
                      </div>
                      <p
                        className="text-sm text-gray-600 mb-3 line-clamp-2  hover:line-clamp-3 transition-all duration-300 ease-in-out "
                        // dir="rtl"
                      >
                        {product.description || 'لا يوجد وصف متاح'}
                      </p>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-blue-600">
                          {product.price.toLocaleString()} ج.م
                        </span>
                        <span className={`text-sm px-2 py-1 rounded-full ${isOutOfStock
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {isOutOfStock ? 'غير متوفر' : `${product.quantity.toLocaleString()} متبقي`}
                        </span>
                      </div>
                      {inCartQuantity > 0 && (
                        <div className="mb-3 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                          <span className="text-sm text-blue-700">في السلة</span>
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {inCartQuantity}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => !isOutOfStock && addToCart(product)}
                        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer font-medium transition-colors ${isOutOfStock
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md'
                          }`}
                        disabled={isOutOfStock}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {isOutOfStock ? 'إنتهى المخزون' : 'أضف للسلة'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div >
  );
}