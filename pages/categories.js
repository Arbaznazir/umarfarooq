import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Book, ArrowLeft } from "lucide-react";
import FaviconHead from "../components/FaviconHead";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const categoriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);
    } catch (error) {
      // Error fetching categories
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-islamic-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Categories - Umar Farooq Al Madani</title>
        <meta
          name="description"
          content="Browse Islamic study categories including Quran, Hadith, and more"
        />
      </Head>
      <FaviconHead />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="flex items-center text-islamic-green hover:text-green-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Islamic Study Categories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore different areas of Islamic knowledge and teachings curated
            by Umar Farooq Al Madani
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Categories Yet
            </h3>
            <p className="text-gray-600">
              Categories will appear here once they are created by the admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.id}`}>
                <div className="bg-white rounded-lg shadow-md p-8 card-hover cursor-pointer h-full">
                  <div className="flex items-center mb-6">
                    <div className="bg-islamic-green rounded-lg p-3">
                      <Book className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description ||
                      "Explore this category to learn more about this topic"}
                  </p>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <span className="text-islamic-green text-sm font-medium">
                      View Posts →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Islamic Quote Section */}
        <div className="mt-20 text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="max-w-3xl mx-auto px-6">
            <p className="quranic-text text-2xl text-islamic-green mb-4">
              وَقُل رَّبِّ زِدْنِي عِلْمًا
            </p>
            <p className="text-lg text-gray-700 italic mb-2">
              "And say: My Lord, increase me in knowledge"
            </p>
            <p className="text-sm text-gray-500">- Quran 20:114</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-islamic-dark text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-2xl font-bold mb-4 arabic-text">
            عمر فاروق المدنی
          </h4>
          <p className="text-gray-300">
            Dedicated to spreading Islamic knowledge and understanding
          </p>
        </div>
      </footer>
    </div>
  );
}
