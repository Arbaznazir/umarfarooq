import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Book, Calendar, Heart, Star, Menu, X } from "lucide-react";
import DatabaseInitializer from "../components/DatabaseInitializer";
import FaviconHead from "../components/FaviconHead";
import { QuranicContent } from "../components/QuranicText";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch latest posts
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(6)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);

      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);

      // Fetch featured posts
      const featuredQuery = query(
        collection(db, "posts"),
        where("featured", "==", true),
        limit(3)
      );
      const featuredSnapshot = await getDocs(featuredQuery);
      const featuredData = featuredSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeaturedPosts(featuredData);
    } catch (error) {
      // Error fetching data
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>Umar Farooq Al Madani - Islamic Studies</title>
        <meta
          name="description"
          content="Islamic studies, Quran translations, and Hadith discussions by Umar Farooq Al Madani"
        />
      </Head>
      <FaviconHead />

      {/* Premium Header */}
      <header className="glass-card relative z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-islamic-gradient p-2 md:p-3 rounded-xl shadow-glow">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white arabic-text">
                    عمر فاروق المدنی
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 md:mt-2 font-medium">
                  Umar Farooq Al Madani
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Islamic Scholar & Teacher
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-islamic-green font-medium transition-colors duration-300 relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-green transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-islamic-green font-medium transition-colors duration-300 relative group"
              >
                Categories
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-green transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/admin"
                className="bg-islamic-gradient text-white px-6 py-2 rounded-full hover:shadow-glow transition-all duration-300 font-medium"
              >
                Admin
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-islamic-green hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-islamic-green transition-colors duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 mb-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-islamic-green hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🏠 Home
                </Link>
                <Link
                  href="/categories"
                  className="text-gray-700 hover:text-islamic-green hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📚 Categories
                </Link>
                <Link
                  href="/admin"
                  className="bg-islamic-gradient text-white block px-3 py-2 rounded-md text-base font-medium hover:opacity-90 transition-opacity duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔐 Admin Panel
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Stunning Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] islamic-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-[70vh] sm:min-h-[80vh]">
          <div className="content-center w-full">
            {/* Bismillah */}
            <div className="floating-animation mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-8 quranic-text hero-text leading-relaxed text-center">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </h2>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 hero-text opacity-95 font-elegant tracking-wide text-center">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>
            </div>

            <div className="section-divider mb-8 sm:mb-12"></div>

            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold elegant-font hero-text leading-tight text-center">
                Welcome to Islamic Knowledge
              </h3>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 leading-relaxed max-w-4xl mx-auto px-4 text-center">
                Discover the profound teachings of Islam through Quranic
                interpretations, authentic Hadith discussions, and scholarly
                insights by Umar Farooq Al Madani.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-4">
                <Link
                  href="/categories"
                  className="w-full sm:w-auto bg-white text-islamic-green px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold hover:shadow-premium transition-all duration-300 transform hover:scale-105 text-center text-sm sm:text-base"
                >
                  Explore Categories
                </Link>
                <Link
                  href="#latest"
                  className="w-full sm:w-auto border-2 border-white text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold hover:bg-white hover:text-islamic-green transition-all duration-300 text-center text-sm sm:text-base"
                >
                  Latest Posts
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full floating-animation"></div>
        <div
          className="absolute bottom-20 right-20 w-24 h-24 border border-white/20 rounded-full floating-animation"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-10 w-16 h-16 border border-white/20 rounded-full floating-animation"
          style={{ animationDelay: "4s" }}
        ></div>
      </section>

      {/* Premium Categories Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gradient elegant-font text-center">
              Islamic Categories
            </h3>
            <div className="section-divider mb-6 sm:mb-8"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 text-center">
              Explore comprehensive Islamic knowledge organized by topics
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-20">
              <div className="premium-card max-w-md mx-auto p-12 rounded-2xl">
                <Book className="h-16 w-16 text-islamic-green mx-auto mb-6" />
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  Coming Soon
                </h4>
                <p className="text-gray-600">
                  Islamic categories will be available here once created by the
                  admin.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <div className="premium-card rounded-2xl p-8 cursor-pointer group">
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-islamic-gradient rounded-2xl mb-6 shadow-glow">
                        <Book className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-islamic-green transition-colors duration-300">
                        {category.name}
                      </h4>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {category.description || "Explore this sacred topic"}
                      </p>
                      <div className="inline-flex items-center text-islamic-green font-semibold group-hover:translate-x-2 transition-transform duration-300">
                        Explore →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Premium Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-20 bg-gradient-to-r from-islamic-cream to-white relative overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-20"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="content-center mb-16">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="bg-gold-gradient p-4 rounded-full shadow-glow">
                  <Star className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gradient elegant-font">
                Featured Wisdom
              </h3>
              <div className="section-divider mb-8"></div>
              <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                Specially curated Islamic insights and teachings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <article className="premium-card rounded-2xl overflow-hidden cursor-pointer group relative">
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gold-gradient px-3 py-1 rounded-full shadow-glow">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-white mr-1" />
                          <span className="text-xs text-white font-medium">
                            Featured
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <h4 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-islamic-green transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h4>

                      <div className="mb-6">
                        {post.language === "arabic" && (
                          <div className="rtl-content">
                            <QuranicContent className="text-lg text-gray-700 leading-loose line-clamp-4">
                              {post.content.substring(0, 200)}...
                            </QuranicContent>
                          </div>
                        )}
                        {post.language === "urdu" && (
                          <div className="rtl-content">
                            <p className="urdu-content text-lg text-gray-700 leading-loose line-clamp-4">
                              {post.content.substring(0, 200)}...
                            </p>
                          </div>
                        )}
                        {post.language === "english" && (
                          <div className="ltr-content">
                            <p className="text-gray-700 leading-relaxed line-clamp-4">
                              {post.content.substring(0, 200)}...
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {post.createdAt?.toDate?.()?.toLocaleDateString() ||
                            "Recent"}
                        </div>
                        <span className="inline-flex items-center text-islamic-gold font-semibold group-hover:translate-x-2 transition-transform duration-300">
                          Read Featured →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Premium Latest Posts */}
      <section
        id="latest"
        className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 islamic-pattern opacity-30"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gradient elegant-font text-center">
              Latest Teachings
            </h3>
            <div className="section-divider mb-6 sm:mb-8"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 text-center">
              Recent insights and knowledge shared for the Muslim community
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="premium-card max-w-md mx-auto p-12 rounded-2xl">
                <Calendar className="h-16 w-16 text-islamic-green mx-auto mb-6" />
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  No Posts Yet
                </h4>
                <p className="text-gray-600">
                  Islamic teachings will appear here once published by the
                  admin.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <article className="premium-card rounded-2xl overflow-hidden cursor-pointer group">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <span className="inline-flex items-center px-3 py-1 bg-islamic-gradient text-white text-sm font-medium rounded-full">
                          {post.category}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {post.createdAt?.toDate?.()?.toLocaleDateString() ||
                            "Recent"}
                        </div>
                      </div>

                      <h4 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-islamic-green transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h4>

                      <div className="mb-6">
                        {post.language === "arabic" && (
                          <div className="rtl-content">
                            <QuranicContent className="text-lg text-gray-700 leading-loose line-clamp-3">
                              {post.content.substring(0, 150)}...
                            </QuranicContent>
                          </div>
                        )}
                        {post.language === "urdu" && (
                          <div className="rtl-content">
                            <p className="urdu-content text-lg text-gray-700 leading-loose line-clamp-3">
                              {post.content.substring(0, 150)}...
                            </p>
                          </div>
                        )}
                        {post.language === "english" && (
                          <div className="ltr-content">
                            <p className="text-gray-700 leading-relaxed line-clamp-3">
                              {post.content.substring(0, 150)}...
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 capitalize font-medium">
                          {post.language}
                        </span>
                        <span className="inline-flex items-center text-islamic-green font-semibold group-hover:translate-x-2 transition-transform duration-300">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative bg-gradient-to-r from-islamic-800 via-islamic-700 to-islamic-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="content-center">
            {/* Main Heading */}
            <div className="mb-8 sm:mb-12 text-center">
              <h4 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 arabic-text hero-text">
                عمر فاروق المدنی
              </h4>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 font-elegant mb-2">
                Umar Farooq Al Madani
              </p>
              <p className="text-base sm:text-lg text-gray-300">
                Islamic Scholar & Teacher
              </p>
            </div>

            {/* Islamic Quote */}
            <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
              <div className="glass-card p-6 sm:p-8 lg:p-12 rounded-2xl">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl quranic-text mb-4 sm:mb-6 text-islamic-200 leading-loose text-center">
                  وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا
                </p>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 italic font-elegant mb-4 text-center">
                  "And whoever is given wisdom has been given much good"
                </p>
                <p className="text-sm text-gray-400 text-center">
                  - Quran 2:269
                </p>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="mb-8 sm:mb-12">
              <p className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed px-4 text-center">
                Dedicated to spreading authentic Islamic knowledge and
                understanding for the benefit of the Muslim Ummah worldwide
              </p>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-white/20 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <Heart className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-gray-300">
                    Made with love for the Ummah
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  © 2024 Umar Farooq Al Madani. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/10 rounded-full floating-animation"></div>
        <div
          className="absolute bottom-10 right-10 w-16 h-16 border border-white/10 rounded-full floating-animation"
          style={{ animationDelay: "3s" }}
        ></div>
      </footer>

      {/* Database Initializer - runs automatically */}
      <DatabaseInitializer />
    </div>
  );
}
