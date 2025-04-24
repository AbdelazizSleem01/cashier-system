'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [users, setUsers] = useState([]);

    const router = useRouter();


    useEffect(() => {
        fetchEmail();
    }, []);

    const fetchEmail = async () => {
        try {
            const data = await fetch('/api/login');
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            console.log('API Response:', data); // Log the response

            if (data.success) {
                sessionStorage.setItem('hasLoggedIn', 'true');

                await Swal.fire({
                    title: 'مرحبًا!',
                    text: 'تم تسجيل الدخول بنجاح',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                });

                router.push('/');
            } else {
                await Swal.fire({
                    title: 'فشل تسجيل الدخول',
                    text: data.message || 'بيانات تسجيل الدخول غير صحيحة',
                    icon: 'error',
                    confirmButtonText: 'حاول مرة أخرى',
                });
            }
        } catch (err) {
            await Swal.fire({
                title: 'خطأ!',
                text: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقًا.',
                icon: 'error',
                confirmButtonText: 'حسنًا',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 mb-12 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-blue-100 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="w-full px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            list='email-suggestions'
                        />
                        <datalist id="email-suggestions">
                            {users.map((user) => (
                                <option key={user._id} value={user.email} />
                            ))}
                        </datalist>

                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <div className="flex items-center mt-2 mb-4 justify-between">
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={() => setShowPassword(!showPassword)}
                                        className="sr-only"
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${showPassword ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showPassword ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Show password</span>
                            </label>
                            <div className="mt-1 text-right">
                                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg ${isLoading ? 'opacity-75' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
