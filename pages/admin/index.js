import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import { Lock, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import FaviconHead from "../../components/FaviconHead";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
      // Login error
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-islamic-green"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Admin Login - Umar Farooq Al Madani</title>
      </Head>
      <FaviconHead />

      <Toaster position="top-right" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-block bg-islamic-gradient p-4 rounded-xl shadow-glow mb-4">
            <h2 className="text-3xl font-bold text-white mb-2 arabic-text">
              عمر فاروق المدنی
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-2">Umar Farooq Al Madani</p>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-islamic-green focus:border-islamic-green sm:text-sm"
                  placeholder="Enter your email"
                />
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-islamic-green focus:border-islamic-green sm:text-sm"
                  placeholder="Enter your password"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white islamic-gradient hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-islamic-green disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Admin access only
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
