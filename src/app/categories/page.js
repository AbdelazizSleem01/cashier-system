"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { PlusCircle, Trash2, ArrowLeft, Loader2, EditIcon } from 'lucide-react';

export default function CategoriesPage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");

      const text = await res.text();
      if (!text) throw new Error("Empty server response");

      const data = JSON.parse(text);
      setCategories(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.message || 'حدث خطأ أثناء جلب البيانات',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      const { value: confirmed } = await Swal.fire({
        title: 'إضافة فئة جديدة',
        text: `هل تريد إضافة فئة "${name}"؟`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'نعم، أضف',
        cancelButtonText: 'إلغاء',
        reverseButtons: true
      });

      if (confirmed) {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        setName("");
        await fetchCategories();
        Swal.fire({
          icon: 'success',
          title: 'تمت الإضافة!',
          text: 'تمت إضافة الفئة بنجاح',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: 'فشل في إضافة الفئة',
        confirmButtonText: 'حسناً'
      });
    }
  };

  const handleEdit = async (id) => {
    const category = categories.find(c => c._id === id);
    const { value: newName } = await Swal.fire({
      title: 'تعديل الفئة',
      input: 'text',
      inputLabel: 'اسم الفئة',
      inputValue: category.name,
      showCancelButton: true,
      confirmButtonText: 'تعديل',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    });

    if (newName) {
      try {
        // Send PUT request with id and newName in the body
        await fetch(`/api/categories`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name: newName }),
        });
        await fetchCategories();
        Swal.fire({
          icon: 'success',
          title: 'تم التعديل!',
          text: 'تم تعديل الفئة بنجاح',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في تعديل الفئة',
          confirmButtonText: 'حسناً'
        });
      }
    }
  }

  const handleDelete = async (id) => {
    const category = categories.find(c => c._id === id);
    const { value: confirmed } = await Swal.fire({
      title: 'حذف الفئة',
      html: `<div class="text-right">هل أنت متأكد من رغبتك في حذف الفئة <strong>${category?.name}</strong>؟</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      customClass: {
        popup: 'text-base'
      }
    });

    if (confirmed) {
      try {
        await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
        await fetchCategories();
        Swal.fire({
          icon: 'success',
          title: 'تم الحذف!',
          text: 'تم حذف الفئة بنجاح',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'فشل في حذف الفئة',
          confirmButtonText: 'حسناً'
        });
      }
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الفئات</h1>
            <p className="mt-1 text-sm text-gray-500">إدارة وتعديل وحذف فئات المنتجات</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة للرئيسية
            </Link>
          </div>
        </div>

        {/* Category Form */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">إضافة فئة جديدة</h3>
          </div>
          <div className="px-6 py-5">
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="أدخل اسم الفئة"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!name.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                إضافة فئة
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">قائمة الفئات</h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {categories.length === 0 ? (
                <div className="px-6 py-4 text-center text-sm text-gray-500">
                  لا توجد فئات متاحة
                </div>
              ) : (categories.map((cat) => (
                <div key={cat._id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(cat._id)}
                      className="btn btn-sm btn-outline btn-info tooltip"
                    >
                      <span className="tooltip-content tooltip-text">تعديل</span>
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="btn btn-sm btn-outline btn-error tooltip"
                    >
                      <span className="tooltip-content tooltip-text">حذف</span>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}