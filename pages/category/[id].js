import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  ArrowLeft,
  Calendar,
  Book,
  Star,
  Eye,
  Heart,
  Sparkles,
  Award,
  Users,
  Clock,
  Globe,
  FileText,
} from "lucide-react";
import { QuranicContent } from "../../components/QuranicText";

export default function CategoryPage() {
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    setMounted(true);
    if (id) {
      fetchCategoryAndPosts();
    }

    // Scroll animation
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  const fetchCategoryAndPosts = async () => {
    try {
      // Fetch category details
      const categoryDoc = await getDoc(doc(db, "categories", id));
      if (categoryDoc.exists()) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
        };
        setCategory(categoryData);

        // Fetch all posts and filter for this category
        const allPostsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc")
        );
        const allPostsSnapshot = await getDocs(allPostsQuery);
        const allPosts = allPostsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter posts that match this category (improved matching)
        const matchingPosts = allPosts.filter((post) => {
          const postCategory = post.category;
          const categoryName = categoryData.name;

          return (
            postCategory === categoryName ||
            postCategory?.toLowerCase() === categoryName?.toLowerCase() ||
            postCategory?.trim() === categoryName?.trim() ||
            post.categoryId === categoryData.id
          );
        });

        setPosts(matchingPosts);
      } else {
        router.push("/404");
      }
    } catch (error) {
      // Error fetching category and posts
    }
    setLoading(false);
  };

  // Particle component for floating effects
  const FloatingParticle = ({
    delay = 0,
    size = "w-2 h-2",
    color = "bg-islamic-green/20",
  }) => (
    <div
      className={`absolute ${size} ${color} rounded-full animate-float opacity-60`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 4}s`,
      }}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 via-emerald-50 via-green-50 to-teal-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Particle Background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.2} />
          ))}
          <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-islamic-green/10 to-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-l from-green-300/20 to-teal-200/30 rounded-full blur-2xl animate-bounce"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-40 left-1/4 w-36 h-36 bg-gradient-to-t from-emerald-400/15 to-islamic-green/20 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Enhanced Loading Animation */}
        <div className="text-center relative z-10">
          <div className="relative mb-12">
            {/* Multiple rotating rings */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-islamic-green/10 border-t-islamic-green border-r-emerald-500 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-2 w-28 h-28 border-3 border-emerald-300/20 border-b-green-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>
            <div
              className="absolute inset-4 w-24 h-24 border-2 border-teal-200/30 border-l-islamic-green rounded-full animate-spin mx-auto"
              style={{ animationDuration: "3s" }}
            ></div>

            {/* Central glowing circle */}
            <div className="w-32 h-32 bg-gradient-to-br from-white via-green-50 to-emerald-100 rounded-full shadow-2xl flex items-center justify-center mx-auto animate-pulse relative">
              <div className="absolute inset-0 bg-islamic-green/20 rounded-full animate-ping"></div>
              <Book className="h-12 w-12 text-islamic-green animate-bounce relative z-10" />
            </div>

            {/* Floating elements around */}
            <Sparkles className="h-6 w-6 text-islamic-green absolute -top-4 -right-4 animate-ping" />
            <Star
              className="h-5 w-5 text-emerald-400 absolute -bottom-2 -left-2 animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
            <Award
              className="h-4 w-4 text-green-500 absolute top-2 left-8 animate-ping"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-black text-transparent bg-gradient-to-r from-islamic-green via-emerald-600 to-teal-600 bg-clip-text animate-fade-in">
              Loading Islamic Content
            </h3>
            <p
              className="text-lg text-gray-600 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Preparing authentic knowledge for you...
            </p>
            <div
              className="flex justify-center space-x-1 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="w-2 h-2 bg-islamic-green rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 via-emerald-50 via-green-50 to-teal-100 flex items-center justify-center relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.15'%3E%3Cpath d='M60 10l15 35h37l-30 22 15 35-30-22-30 22 15-35-30-22h37z'/%3E%3Ccircle cx='60' cy='60' r='8' fill-opacity='0.1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.3} color="bg-red-400/30" />
          ))}
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-12">
            <div className="w-40 h-40 bg-gradient-to-br from-white via-red-50 to-orange-100 rounded-3xl shadow-2xl flex items-center justify-center mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-3xl"></div>
              <Book className="h-20 w-20 text-red-500 relative z-10" />
            </div>
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <span className="text-white text-2xl font-bold">!</span>
            </div>
            {/* Error sparkles */}
            <Sparkles className="h-4 w-4 text-red-400 absolute top-4 left-4 animate-ping" />
            <Star
              className="h-3 w-3 text-orange-400 absolute bottom-6 right-8 animate-ping"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text mb-6">
            Category Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto">
            The Islamic category you're looking for could not be found.
          </p>

          <Link
            href="/categories"
            className="group relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-islamic-green via-emerald-600 to-green-600 text-white rounded-3xl hover:from-green-600 hover:via-islamic-green hover:to-emerald-600 transition-all duration-700 transform hover:scale-110 shadow-2xl hover:shadow-islamic-green/30 text-xl font-bold overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <ArrowLeft className="h-6 w-6 mr-4 transform group-hover:-translate-x-3 transition-transform duration-500 relative z-10" />
            <span className="relative z-10">Return to Categories</span>
            <Sparkles className="h-5 w-5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 relative z-10" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green/5 via-emerald-50 via-green-50 to-teal-100 relative overflow-hidden">
      <Head>
        <title>
          {category.name} - Umar Farooq Al Madani | Islamic Knowledge
        </title>
        <meta
          name="description"
          content={`${
            category.description ||
            `Authentic Islamic content about ${category.name}`
          } - Umar Farooq Al Madani`}
        />
        <meta
          name="keywords"
          content={`Islamic, ${category.name}, Umar Farooq Al Madani, Islamic knowledge, Quran, Hadith`}
        />
      </Head>

      {/* Advanced Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Particle System */}
        {[...Array(30)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.2}
            size={i % 3 === 0 ? "w-3 h-3" : "w-2 h-2"}
            color={
              i % 4 === 0
                ? "bg-islamic-green/20"
                : i % 4 === 1
                ? "bg-emerald-300/20"
                : i % 4 === 2
                ? "bg-green-400/20"
                : "bg-teal-300/20"
            }
          />
        ))}

        {/* Large floating elements with parallax */}
        <div
          className="absolute top-20 left-10 w-48 h-48 bg-gradient-to-br from-islamic-green/10 to-emerald-200/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div
          className="absolute top-80 right-20 w-40 h-40 bg-gradient-to-l from-green-300/20 to-teal-200/30 rounded-full blur-2xl animate-bounce"
          style={{
            animationDuration: "5s",
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        ></div>
        <div
          className="absolute bottom-60 left-1/4 w-36 h-36 bg-gradient-to-t from-emerald-400/15 to-islamic-green/25 rounded-full blur-xl animate-pulse"
          style={{
            animationDelay: "3s",
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-br from-teal-300/20 to-green-400/25 rounded-full blur-2xl animate-bounce"
          style={{
            animationDelay: "1.5s",
            animationDuration: "6s",
            transform: `translateY(${scrollY * 0.12}px)`,
          }}
        ></div>
      </div>

      {/* Premium Navigation Header */}
      <header className="relative bg-white/95 backdrop-blur-2xl border-b border-islamic-green/20 sticky top-0 z-50 shadow-xl shadow-islamic-green/10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-islamic-green/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent"></div>

        {/* Islamic pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0l4 12h13l-10 7 4 12-10-7-10 7 4-12-10-7h13z' fill='%23059669' fill-opacity='0.3'/%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/categories"
            className="group flex items-center text-islamic-green hover:text-green-700 font-bold transition-all duration-500 transform hover:scale-110"
          >
            <div className="mr-4 p-3 bg-gradient-to-br from-islamic-green/20 to-emerald-200/30 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-islamic-green/30 group-hover:to-green-300/40 transition-all duration-500 shadow-lg group-hover:shadow-xl">
              <ArrowLeft className="h-6 w-6 transform group-hover:-translate-x-2 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black">Back to Categories</span>
              <span className="text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Explore more Islamic content
              </span>
            </div>
            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
          </Link>
        </div>
      </header>

      {/* Absolutely Spectacular Category Header */}
      <section className="relative overflow-hidden py-32">
        {/* Multi-layered Premium Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-islamic-green via-emerald-600 via-green-600 to-teal-600"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-islamic-green/20 to-transparent"></div>

          {/* Complex Islamic Patterns */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M50 5l12 35h37l-30 22 12 35-30-22-30 22 12-35-30-22h37z'/%3E%3Ccircle cx='50' cy='50' r='8'/%3E%3Cpath d='M20 20l8 24h25l-20 15 8 24-20-15-20 15 8-24-20-15h25z'/%3E%3Cpath d='M80 80l8 24h25l-20 15 8 24-20-15-20 15 8-24-20-15h25z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Advanced Floating Geometric Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-20 h-20 border-3 border-white/30 rounded-2xl rotate-45 animate-slow-bounce shadow-lg"></div>
          <div
            className="absolute top-40 right-32 w-16 h-16 bg-white/20 rounded-full animate-float shadow-xl"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute bottom-40 left-1/4 w-24 h-24 border-2 border-white/20 rounded-full animate-slow-spin"></div>
          <div className="absolute top-60 right-20 w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 transform rotate-45 animate-pulse shadow-lg"></div>
          <div
            className="absolute bottom-60 right-1/4 w-14 h-14 border border-white/25 rotate-12 animate-bounce"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-32 left-1/2 w-10 h-10 bg-white/15 rounded-lg rotate-45 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          {/* Magnificent Icon Container */}
          <div className="relative inline-block mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-2xl scale-150 animate-pulse"></div>
            <div className="relative w-36 h-36 bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-sm rounded-full flex items-center justify-center transform hover:scale-125 transition-transform duration-700 animate-float shadow-2xl border border-white/30">
              <Book className="h-16 w-16 text-white drop-shadow-2xl" />
              <div className="absolute -top-4 -right-4">
                <Star
                  className="h-12 w-12 text-yellow-300 animate-spin drop-shadow-lg"
                  style={{ animationDuration: "4s" }}
                />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Award
                  className="h-8 w-8 text-amber-200 animate-bounce drop-shadow-lg"
                  style={{ animationDelay: "1s" }}
                />
              </div>
            </div>
          </div>

          {/* Spectacular Category Title */}
          <div className="relative mb-12">
            <h1
              className={`text-7xl md:text-8xl lg:text-9xl font-black mb-6 text-white drop-shadow-2xl ${
                mounted ? "animate-fade-in-up" : ""
              }`}
            >
              <span className="bg-gradient-to-r from-white via-emerald-100 via-green-100 to-white bg-clip-text text-transparent filter drop-shadow-xl">
                {category.name}
              </span>
            </h1>

            {/* Multiple animated underlines */}
            <div className="flex justify-center space-x-4">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full animate-pulse"></div>
              <div
                className="w-16 h-1 bg-gradient-to-r from-transparent via-emerald-200 to-transparent rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="w-20 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
          </div>

          {/* Enhanced Description with Calligraphy Effect */}
          {category.description && (
            <div
              className={`mb-16 ${mounted ? "animate-fade-in-up" : ""}`}
              style={{ animationDelay: "0.3s" }}
            >
              <p className="text-3xl text-white/95 mb-4 max-w-5xl mx-auto leading-relaxed font-light drop-shadow-lg">
                {category.description}
              </p>
              <div className="text-lg text-white/80 italic">
                "In the name of Allah, the Most Gracious, the Most Merciful"
              </div>
              <div className="text-2xl quranic-text text-white/90 mt-2 drop-shadow-lg">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
              </div>
            </div>
          )}

          {/* Ultimate Premium Stats Cards */}
          <div
            className={`flex flex-wrap items-center justify-center gap-8 ${
              mounted ? "animate-fade-in-up" : ""
            }`}
            style={{ animationDelay: "0.6s" }}
          >
            <div className="group bg-gradient-to-br from-white/25 via-white/20 to-white/15 backdrop-blur-xl rounded-3xl px-10 py-6 hover:bg-gradient-to-br hover:from-white/35 hover:to-white/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl border border-white/30">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-white/40 group-hover:to-white/20 transition-all duration-300 shadow-lg">
                  <Book className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div>
                  <div className="text-white font-black text-2xl drop-shadow-lg">
                    {posts.length}
                  </div>
                  <div className="text-white/90 font-bold text-lg">
                    {posts.length === 1 ? "Post" : "Posts"}
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white/25 via-white/20 to-white/15 backdrop-blur-xl rounded-3xl px-10 py-6 hover:bg-gradient-to-br hover:from-white/35 hover:to-white/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl border border-white/30">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-white/40 group-hover:to-white/20 transition-all duration-300 shadow-lg">
                  <Award className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div className="text-white font-black text-xl drop-shadow-lg">
                  Premium Content
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white/25 via-white/20 to-white/15 backdrop-blur-xl rounded-3xl px-10 py-6 hover:bg-gradient-to-br hover:from-white/35 hover:to-white/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl border border-white/30">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl group-hover:bg-gradient-to-br group-hover:from-white/40 group-hover:to-white/20 transition-all duration-500 shadow-lg">
                  <Globe className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div className="text-white font-black text-xl drop-shadow-lg">
                  Islamic Community
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ultra-Premium Posts Section */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {posts.length === 0 ? (
          <div
            className={`text-center py-32 ${mounted ? "animate-fade-in" : ""}`}
          >
            <div className="relative inline-block mb-16">
              <div className="absolute inset-0 bg-gradient-to-br from-islamic-green/20 to-emerald-300/30 rounded-full blur-3xl scale-200 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white via-green-50 to-emerald-100 rounded-full p-16 shadow-2xl transform hover:scale-105 transition-transform duration-300 border-4 border-islamic-green/20">
                <Book className="h-24 w-24 text-islamic-green mx-auto mb-8" />
                <div className="absolute -top-6 -right-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-5xl font-black text-transparent bg-gradient-to-r from-islamic-green via-emerald-600 to-green-600 bg-clip-text mb-8">
              No Posts Yet
            </h3>
            <p className="text-gray-600 mb-16 text-2xl max-w-2xl mx-auto leading-relaxed">
              No posts have been published in this category yet. Check back soon
              for authentic Islamic content and knowledge!
            </p>

            <Link
              href="/categories"
              className="group relative inline-flex items-center px-16 py-8 bg-gradient-to-r from-islamic-green via-emerald-600 to-green-600 text-white rounded-3xl hover:from-green-600 hover:via-islamic-green hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-islamic-green/40 text-2xl font-black overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <ArrowLeft className="h-8 w-8 mr-6 transform group-hover:-translate-x-4 transition-transform duration-500 relative z-10" />
              <span className="relative z-10">Browse Other Categories</span>
              <div className="ml-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-125 relative z-10">
                <Sparkles className="h-6 w-6" />
              </div>
            </Link>
          </div>
        ) : (
          <div className={mounted ? "animate-fade-in" : ""}>
            {/* Magnificent Section Header */}
            <div className="text-center mb-20">
              <div className="relative inline-block mb-12">
                <h2 className="text-6xl md:text-7xl font-black text-gray-900 relative z-10 drop-shadow-lg">
                  Latest Posts in{" "}
                  <span className="bg-gradient-to-r from-islamic-green via-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {category.name}
                  </span>
                </h2>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-3 bg-gradient-to-r from-islamic-green/30 via-islamic-green to-islamic-green/30 rounded-full blur-sm"></div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-emerald-400/50 to-green-500/50 rounded-full blur-lg"></div>
              </div>
              <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover authentic Islamic knowledge and wisdom from trusted
                sources
              </p>
              <div className="text-lg text-islamic-green mt-4 font-semibold">
                عِلْمٌ نَافِعٌ - Beneficial Knowledge
              </div>
            </div>

            {/* Ultra-Premium Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
              {posts.map((post, index) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <article
                    className={`group bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] h-full border-2 border-gray-100/50 hover:border-islamic-green/50 relative ${
                      mounted ? "animate-fade-in-up" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Premium Card Header */}
                    <div className="relative p-10 bg-gradient-to-br from-islamic-green/15 via-emerald-100/50 to-green-200/30 overflow-hidden">
                      {/* Complex Background Pattern */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.15'%3E%3Cpath d='M25 5l6 18h19l-15 11 6 18-15-11-15 11 6-18-15-11h19z'/%3E%3Ccircle cx='25' cy='25' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      ></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-islamic-green to-emerald-600 text-white text-sm font-black rounded-full transform group-hover:scale-105 transition-transform duration-300 shadow-xl">
                              {post.category}
                            </span>
                            {post.pdfAttachment && (
                              <span className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                                <FileText className="h-3 w-3 mr-1" />
                                PDF
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 bg-white/90 rounded-full px-4 py-2 shadow-lg">
                            <Clock className="h-4 w-4 mr-2" />
                            {post.createdAt?.toDate?.()?.toLocaleDateString() ||
                              "Recent"}
                          </div>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-islamic-green transition-colors duration-500 line-clamp-2 leading-tight mb-6 drop-shadow-sm">
                          {post.title}
                        </h3>

                        {/* Enhanced Badges */}
                        <div className="flex items-center flex-wrap gap-3">
                          <span className="inline-flex items-center px-4 py-2 bg-white/80 text-gray-700 text-xs font-bold rounded-full capitalize border-2 border-gray-200/50 shadow-sm">
                            <Globe className="h-3 w-3 mr-2" />
                            {post.language || "english"}
                          </span>
                          {post.featured && (
                            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white text-xs font-black rounded-full shadow-lg">
                              <Star className="h-3 w-3 mr-2" />
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ultra-Premium Card Body */}
                    <div className="p-10">
                      <div className="mb-10">
                        {post.language === "arabic" && (
                          <QuranicContent className="text-xl text-gray-700 leading-relaxed line-clamp-4 font-medium drop-shadow-sm">
                            {post.content.substring(0, 200)}...
                          </QuranicContent>
                        )}
                        {post.language === "urdu" && (
                          <p className="urdu-text text-xl text-gray-700 leading-relaxed line-clamp-4 font-medium drop-shadow-sm">
                            {post.content.substring(0, 200)}...
                          </p>
                        )}
                        {(post.language === "english" || !post.language) && (
                          <p className="text-gray-600 leading-relaxed line-clamp-4 text-xl font-medium">
                            {post.content.substring(0, 200)}...
                          </p>
                        )}
                      </div>

                      {/* Spectacular Card Footer */}
                      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm font-medium">Like</span>
                          </div>
                        </div>

                        <div className="flex items-center text-islamic-green text-lg font-bold group-hover:text-green-700 transition-colors duration-300">
                          <span className="mr-2">Read more</span>
                          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-islamic-green/20 to-emerald-200/40 rounded-xl group-hover:bg-gradient-to-br group-hover:from-islamic-green/30 group-hover:to-green-300/50 transition-all duration-300 shadow-md">
                            <ArrowLeft className="h-5 w-5 rotate-180 transform group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Premium Hover Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-islamic-green/0 via-islamic-green/10 to-emerald-300/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"></div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
