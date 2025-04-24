"use client";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { PlusCircle, Trash2, ArrowLeft, Save, XCircle, Loader2, Search, Edit, Home, PlusCircleIcon } from 'lucide-react';
import Link from "next/link";
import ProductBarcode from "../components/ProductBarcode";
import BarcodeScanner from "../components/BarcodeScanner";

export default function ProductsPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    barcode: ""
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);


  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);



  const generateBarcode = () => {
    const randomNumber = Math.floor(Math.random() * 1000000000);
    return `PROD-${randomNumber.toString().padStart(12, '0')}`;
  };

  useEffect(() => {
    const handleBarcodeScanned = (e) => {
      const barcodeInput = document.getElementById('barcode-input');
      if (!barcodeInput) return;

      if (document.activeElement !== barcodeInput) {
        barcodeInput.focus();
        barcodeInput.value = e.key;
      }
    };

    window.addEventListener('keypress', handleBarcodeScanned);
    return () => window.removeEventListener('keypress', handleBarcodeScanned);
  }, []);


  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      showError('فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      showError('فشل في تحميل الفئات');
    }
  };

  const showError = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'خطأ',
      text: message,
      confirmButtonText: 'حسناً'
    });
  };

  const showSuccess = (title, message) => {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isEdit = !!editId;
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/products?id=${editId}` : "/api/products";

      const { value: confirmed } = await Swal.fire({
        title: `<div class="flex items-center gap-3 text-xl font-bold ${isEdit ? 'text-blue-600' : 'text-green-600'}">
          ${isEdit ? '✏️ تأكيد التعديل' : ` ➕ تأكيد الإضافة`}
        </div>`,
        html: `<div class="text-right space-y-4">
          <p class="text-gray-700 text-lg font-medium">
            ${isEdit ? 'الرجاء مراجعة التعديلات قبل التأكيد' : 'الرجاء مراجعة بيانات المنتج الجديد'}
          </p>
  
          <div class="p-4 ${isEdit ? 'bg-blue-50 border-2 border-blue-100' : 'bg-green-50 border-2 border-green-100'} rounded-xl animate-fade-in">
            <div class="space-y-3 text-gray-800">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center">
                  ${isEdit ? '✏️' : '📦'}
                </span>
                <strong>الاسم:</strong> 
                <span class="font-semibold">${form.name}</span>
              </div>
  
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center">
                  📝
                </span>
                <strong>الوصف:</strong> 
                <span class="text-gray-600">${form.description || '—'}</span>
              </div>
  
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center">
                  💵
                </span>
                <strong>السعر:</strong> 
                <span class="text-green-600 font-bold">${form.price.toLocaleString()} ج.م</span>
              </div>
  
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center">
                  🏷️
                </span>
                <strong>الفئة:</strong> 
                <span class="text-purple-600 font-bold">
                  ${categories.find(c => c._id === form.category)?.name || '—'}
                </span>
              </div>
  
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center">
                  📊
                </span>
                <strong>الكمية:</strong> 
                <span class="${form.quantity > 0 ? 'text-blue-600' : 'text-red-600'} font-bold">
                  ${form.quantity}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center">
                  🔲
                </span>
                <strong>الباركود:</strong> 
                <span class="font-mono text-gray-800">${form.barcode || '—'}</span>
              </div>
            </div>
          </div>
  
          <p class="text-sm ${isEdit ? 'text-blue-500' : 'text-green-500'}">
            ${isEdit ? 'سيتم تحديث المنتج في النظام فور التأكيد' : 'سيتم إضافة المنتج إلى المخزن مباشرة'}
          </p>
        </div>`,
        showCancelButton: true,
        confirmButtonText: isEdit ? `<p class = "cursor-pointer  "> تأكيد التعديل ✏️ </p> ` : ` <p class = "cursor-pointer  "> تأكيد الإضافة ➕</p> `,
        cancelButtonText: `<p class = "cursor-pointer">إلغاء الإجراء ❌</p>`,
        reverseButtons: true,
        focusConfirm: false,
        showClass: {
          popup: 'animate-scale-in'
        },
        hideClass: {
          popup: 'animate-scale-out'
        },
        customClass: {
          popup: `rounded-2xl border-2 ${isEdit ? 'border-blue-100' : 'border-green-100'}`,
          title: 'mb-4',
          htmlContainer: 'text-right',
          confirmButton: `${isEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-lg transition-all duration-200`,
          cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-gray-200 transition-all duration-200 mr-2'
        },
        iconHtml: `
          <div class="animate-pulse p-4 ${isEdit ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full">
            ${isEdit ? `
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            ` : `
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            `}
          </div>
        `,
        buttonsStyling: false,
        backdrop: `rgba(${isEdit ? '59, 130, 246' : '34, 197, 94'}, 0.05)`
      });

      if (confirmed) {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || (isEdit ? "Failed to update product" : "Failed to add product"));
        }

        const updatedProduct = await response.json();

        // Update the products list immediately
        if (isEdit) {
          setProducts(products.map(p =>
            p._id === updatedProduct._id ? updatedProduct : p
          ));
        } else {
          setProducts([...products, updatedProduct]);
        }

        resetForm();
        showSuccess(isEdit ? 'تم التعديل!' : 'تمت الإضافة!', isEdit ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
      }
    } catch (error) {
      showError(error.message || 'حدث خطأ أثناء العملية');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      quantity: product.quantity || "",
      category: product.category?._id || "",
      barcode: product.barcode || ""
    });
    setEditId(product._id);
  };

  const handleDelete = async (id) => {
    const product = products.find(p => p._id === id);

    const { value: confirmed } = await Swal.fire({
      title: '<div class="flex items-center gap-3 text-2xl font-bold text-red-600">🗑️ حذف المنتج</div>',
      html: `<div class="text-right space-y-4">
      <p class="text-gray-700 text-lg">هل أنت متأكد من رغبتك في حذف هذا المنتج بشكل دائم؟</p>
      
      <div class="p-4 bg-red-50 border-2 border-red-100 rounded-xl animate-fade-in">
        <div class="space-y-2 text-gray-800">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center">📛</span>
            <strong>الاسم:</strong> 
            <span class="font-semibold">${product.name}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center">📝</span>
            <strong>الوصف:</strong> 
            <span class="text-gray-600">${product.description || '—'}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center">💵</span>
            <strong>السعر:</strong> 
            <span class="text-green-600 font-bold">${product.price.toLocaleString()} ج.م</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center">📦</span>
            <strong>الكمية:</strong> 
            <span class="${product.quantity > 0 ? 'text-blue-600' : 'text-red-600'} font-bold">${product.quantity}</span>
          </div>
        </div>
      </div>
      
      <p class="text-sm text-gray-500 mt-2">⚠️ لا يمكن استعادة المنتج بعد الحذف!</p>
    </div>`,
      showCancelButton: true,
      confirmButtonText: `<p className='btn cursor-pointer'>تأكيد الحذف 🗑️ </p> `,
      cancelButtonText: 'إلغاء الإجراء ❌',
      reverseButtons: true,
      focusConfirm: false,
      showClass: {
        popup: 'animate-scale-in'
      },
      hideClass: {
        popup: 'animate-scale-out'
      },
      customClass: {
        popup: 'rounded-2xl border-2 border-red-100',
        title: 'mb-4',
        htmlContainer: 'text-right',
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-red-300 transition-all duration-200',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-gray-200 transition-all duration-200 mr-2'
      },
      iconHtml: `
      <div class="animate-pulse p-4 bg-red-100 rounded-full">
        <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </div>
    `,
      buttonsStyling: false,
      backdrop: 'rgba(220, 38, 38, 0.05)'
    });

    if (confirmed) {
      try {
        await fetch(`/api/products?id=${id}`, { method: "DELETE" });
        await fetchProducts();
        showSuccess('تم الحذف!', 'تم حذف المنتج بنجاح');
      } catch (error) {
        showError('فشل في حذف المنتج');
      }
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category: ""
    });
    setEditId(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory ? product.category?._id === selectedCategory : true;

    return matchesSearch && matchesCategory;
  });

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
    <div className="min-h-screen bg-gray-50 mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
            <p className="mt-1 text-sm text-gray-500">إدارة وتعديل وحذف منتجات المتجر</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة للرئيسية
            </Link>
          </div>
        </div>

        {/* Product Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {editId ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h3>
          </div>
          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المنتج
                </label>
                <input
                  type="text"
                  id="name"
                  className="block w-full rounded-md input bg-transparent border-gray-600 text-gray-800 sm:text-sm p-2 border"
                  placeholder="أدخل اسم المنتج"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              {/* description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  وصف المنتج
                </label>
                <textarea
                  id="description"
                  className="block w-full rounded-md input bg-transparent border-gray-500 text-gray-900 sm:text-sm p-2 border"
                  placeholder="أدخل وصف المنتج"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  السعر
                </label>
                <input
                  type="number"
                  id="price"
                  className="block w-full rounded-md input bg-transparent border-gray-500 text-gray-900 sm:text-sm p-2 border"
                  placeholder="أدخل السعر"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  الكمية
                </label>
                <input
                  type="number"
                  id="quantity"
                  className="block w-full rounded-md input bg-transparent border-gray-500 text-gray-900 sm:text-sm p-2 border"
                  placeholder="أدخل الكمية"
                  value={form.quantity || ""}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  min="0"
                  required
                />
              </div>

              <div className="w-full">
                <label htmlFor="category" className="block  text-sm font-medium text-gray-700 mb-1">
                  الفئة
                </label>
                <select
                  id="category"
                  className="block w-full cursor-pointer rounded-md input bg-transparent border-gray-500 text-gray-900 sm:text-sm p-2 border"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="">
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                    باركود المنتج
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="barcode"
                      className="block w-full rounded-md input bg-transparent border-gray-500 text-gray-900 sm:text-sm p-2 border"
                      placeholder="أدخل باركود المنتج أو استخدم الماسح"
                      value={form.barcode || ''}
                      onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, barcode: generateBarcode() })}
                      className="btn "
                    >
                      توليد باركود
                    </button>
                  </div>
                </div>


                <div className="flex justify-start mt-2">
                  <ProductBarcode barcode={form.barcode} />
                </div>

              </div>
              <div className="sm:col-span-2 flex justify-end space-x-3">
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex cursor-pointer items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    إلغاء
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!form.name || !form.price || !form.quantity || !form.category || !form.barcode}
                  className="inline-flex items-center cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editId ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      حفظ التغييرات
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      إضافة منتج
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* bar */}

        <div className="mb-4">
          <BarcodeScanner onScan={(barcode) => {
            setScannedBarcode(barcode);
            setForm({ ...form, barcode });
          }} />

          {scannedBarcode && (
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
              <p className="text-green-700">تم مسح الباركود: {scannedBarcode}</p>
            </div>
          )}
        </div>
        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-gray-900">قائمة المنتجات</h3>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base text-gray-700 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">جميع الفئات</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الباركود
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الاسم
                    </th>
                    {/* description */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوصف
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السعر
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الكمية
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الفئة
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        لا توجد منتجات متاحة
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 ">
                          <ProductBarcode barcode={product.barcode} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        {/* description */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.description || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.price} جنيه
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.quantity > 10 ? 'bg-green-100 text-green-800' :
                            product.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category?.name || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="btn btn-sm btn-outline btn-info tooltip"
                            >
                              <span className="tooltip-content text-white">تعديل</span>
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="btn btn-sm btn-outline btn-error tooltip"
                            >
                              <span className="tooltip-content text-white">حذف</span>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
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