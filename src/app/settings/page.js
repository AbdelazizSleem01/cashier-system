'use client'
import { useState, useEffect } from 'react';
import { Save, Store, Upload, Home } from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function StoreSettings() {
    const [storeInfo, setStoreInfo] = useState({
        name: '',
        address: '',
        phone: '',
        logo: ''
    });

    useEffect(() => {
        const savedStoreInfo = localStorage.getItem('storeInfo');
        if (savedStoreInfo) {
            setStoreInfo(JSON.parse(savedStoreInfo));
        }
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'خطأ في الملف',
                    text: 'الرجاء اختيار ملف صورة فقط',
                    confirmButtonColor: '#3B82F6',
                    background: '#fff',
                    color: '#1F2937'
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setStoreInfo(prev => ({
                    ...prev,
                    logo: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!storeInfo.name || !storeInfo.phone) {
            Swal.fire({
                icon: 'warning',
                title: 'بيانات ناقصة',
                html: `
                    <div class="text-right text-gray-700">
                        <p>الرجاء إدخال:</p>
                        <ul class="list-disc pr-4 mt-2">
                            ${!storeInfo.name ? '<li>اسم المتجر</li>' : ''}
                            ${!storeInfo.phone ? '<li>رقم الهاتف</li>' : ''}
                        </ul>
                    </div>
                `,
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#3B82F6',
                background: '#fff',
                color: '#1F2937'
            });
            return;
        }

        localStorage.setItem('storeInfo', JSON.stringify(storeInfo));

        Swal.fire({
            title: '<strong>تم الحفظ بنجاح!</strong>',
            html: `
                <div class="text-right text-gray-700">
                    <p>تم تحديث إعدادات المتجر بنجاح</p>
                    <div class="mt-4 p-2 bg-blue-50 rounded-lg">
                        <p class="font-medium my-1">${storeInfo.name}</p>
                        <p class="font-medium my-1">${storeInfo.address}</p>
                        <p class="font-medium my-1">${storeInfo.phone}</p>

                        ${storeInfo.logo ?
                    `<img src="${storeInfo.logo}" class="w-22 h-22 object-contain mx-auto mt-2"/>` : ''
                }
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'تم',
            confirmButtonColor: '#3B82F6',
            background: '#fff',
            color: '#1F2937',
        });
    };

    return (
        <>
            <header className="bg-white border-b border-gray-200 px-4 h-16 flex justify-between items-center text-gray-800">
                <h2 className="text-xl font-semibold ">تحديث معلومات المتجر </h2>
                {/* logo */}
                <div className="flex items-center p-0">
                    <img src="/logo1.png" alt="Logo" className="h-20 w-20 " />
                </div>
            </header>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 md:p-8 mb-14">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8">
                        <div className="flex items-center gap-4 text-white">
                            <Store className="h-8 w-8" />
                            <div>
                                <h1 className="text-2xl font-bold">إعدادات المتجر</h1>
                                <p className="text-sm opacity-90 mt-1">إدارة معلومات متجرك وعنوانك وشعارك</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-6">
                        {/* Store Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">اسم المتجر</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border text-gray-800 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="أدخل اسم المتجر"
                                value={storeInfo.name}
                                onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">العنوان</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border text-gray-800 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="أدخل عنوان المتجر"
                                value={storeInfo.address}
                                onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-3 rounded-lg border text-gray-800 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="أدخل رقم الهاتف"
                                value={storeInfo.phone}
                                onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                            />
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">شعار المتجر</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="logo-upload"
                                    onChange={handleImageUpload}
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors group-hover:bg-blue-50"
                                >
                                    {storeInfo.logo ? (
                                        <div className="relative">
                                            <img
                                                src={storeInfo.logo}
                                                alt="شعار المتجر"
                                                className="w-32 h-32 object-contain rounded-lg shadow-sm"
                                            />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <Upload className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-12 w-12 text-gray-400 mb-2" />
                                            <p className="text-gray-500 text-center">
                                                <span className="text-blue-600 font-medium">انقر لرفع صورة</span>
                                                <br />
                                                أو اسحبها إلى هنا
                                            </p>
                                            <p className="text-sm text-gray-400 mt-2">(PNG, JPG, SVG بحد أقصى 2MB)</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="h-5 w-5" />
                            حفظ الإعدادات
                        </button>
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