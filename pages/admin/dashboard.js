import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import {
  Plus,
  Book,
  FileText,
  LogOut,
  Edit,
  Trash2,
  Star,
  Save,
  X,
  BarChart3,
  Users,
  Eye,
  Calendar,
  TrendingUp,
  Settings,
  Crown,
  Sparkles,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import FaviconHead from "../../components/FaviconHead";
import {
  AdminTextHelper,
  IslamicTextRenderer,
} from "../../components/IslamicTextRenderer";
import PDFUploader from "../../components/PDFUploader";

export default function AdminDashboard() {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfSearchTerm, setPdfSearchTerm] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const router = useRouter();

  // Form states
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postLanguage, setPostLanguage] = useState("english");
  const [postFeatured, setPostFeatured] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [postPdf, setPostPdf] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchCategories();
      fetchPDFs();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(postsQuery);
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    } catch (error) {
      // Error fetching posts
    }
  };

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
  };

  const fetchPDFs = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("pdfAttachment", "!=", null)
      );
      const snapshot = await getDocs(postsQuery);
      const pdfData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          postTitle: data.title,
          postCategory: data.category,
          postLanguage: data.language,
          createdAt: data.createdAt,
          pdfAttachment: data.pdfAttachment,
        };
      });
      setPdfs(pdfData);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin");
    } catch (error) {
      // Logout error
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!postTitle || !postContent || !postCategory) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Prepare PDF attachment data
      let pdfData = null;
      if (postPdf) {
        pdfData = {
          filename: postPdf.filename,
          originalName: postPdf.originalName,
          url: postPdf.url,
          size: postPdf.size,
          isBase64: postPdf.isBase64 || false,
          environment: postPdf.environment || "unknown",
        };

        // Handle large files by storing content separately
        if (postPdf.content) {
          const contentSize = postPdf.content.length;
          const firestoreLimit = 800000; // Conservative 800KB limit for main document

          if (contentSize < firestoreLimit) {
            // Small file - store content in main document
            pdfData.content = postPdf.content;
            pdfData.storageType = "inline";
            console.log("PDF content stored inline (small file)");
          } else {
            // Large file - store content in separate document
            try {
              const pdfContentRef = await addDoc(
                collection(db, "pdf_contents"),
                {
                  filename: postPdf.filename,
                  content: postPdf.content,
                  createdAt: serverTimestamp(),
                  size: postPdf.size,
                }
              );

              pdfData.contentDocId = pdfContentRef.id;
              pdfData.storageType = "separate";
              console.log(
                "PDF content stored in separate document:",
                pdfContentRef.id
              );
            } catch (contentError) {
              console.error(
                "Failed to store PDF content separately:",
                contentError
              );
              // Fallback: store without content
              pdfData.storageType = "metadata_only";
              pdfData.warning = "Content too large for storage";
            }
          }
        }

        console.log("PDF data being saved:", {
          ...pdfData,
          content: pdfData.content
            ? `${pdfData.content.length} characters`
            : "stored separately or not included",
        });
      }

      const postData = {
        title: postTitle,
        content: postContent,
        category: postCategory,
        language: postLanguage,
        featured: postFeatured,
        pdfAttachment: pdfData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Saving post data:", {
        ...postData,
        pdfAttachment: pdfData
          ? `PDF attached (${pdfData.storageType})`
          : "No PDF",
      });

      if (editingPost) {
        await updateDoc(doc(db, "posts", editingPost.id), {
          ...postData,
          createdAt: editingPost.createdAt, // Keep original creation date
        });
        toast.success("Post updated successfully!");
        setEditingPost(null);
      } else {
        await addDoc(collection(db, "posts"), postData);
        toast.success("Post created successfully!");
      }

      resetPostForm();
      fetchPosts();
      fetchPDFs(); // Refresh PDFs when a post is saved
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error(`Error saving post: ${error.message}`);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryName) {
      toast.error("Please enter category name");
      return;
    }

    try {
      await addDoc(collection(db, "categories"), {
        name: categoryName,
        description: categoryDescription,
        createdAt: serverTimestamp(),
      });

      toast.success("Category created successfully!");
      setCategoryName("");
      setCategoryDescription("");
      setShowCategoryForm(false);
      fetchCategories();
    } catch (error) {
      // Error creating category
      toast.error("Error creating category");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        toast.success("Post deleted successfully!");
        fetchPosts();
        fetchPDFs(); // Refresh PDFs when a post is deleted
      } catch (error) {
        // Error deleting post
        toast.error("Error deleting post");
      }
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostContent(post.content);
    setPostCategory(post.category);
    setPostLanguage(post.language);
    setPostFeatured(post.featured || false);
    setPostPdf(post.pdfAttachment || null);
    setShowPostForm(true);
  };

  const resetPostForm = () => {
    setPostTitle("");
    setPostContent("");
    setPostCategory("");
    setPostLanguage("english");
    setPostFeatured(false);
    setShowPreview(false);
    setPostPdf(null);
    setPdfUploading(false);
    setShowPostForm(false);
    setEditingPost(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-islamic-green mx-auto mb-4"></div>
          <p className="text-islamic-green font-semibold text-lg">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50">
      <Head>
        <title>Admin Dashboard - Umar Farooq Al Madani</title>
      </Head>
      <FaviconHead />

      <Toaster position="top-right" />

      {/* Premium Header */}
      <header className="relative bg-gradient-to-r from-islamic-green via-emerald-600 to-green-600 shadow-2xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 5l8 24h25l-20 15 8 24-20-15-20 15 8-24-20-15h25z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                  Admin Dashboard
                </h1>
                <p className="text-white/90 text-lg font-medium mt-1">
                  Welcome back, <span className="font-bold">{user.email}</span>
                </p>
                <div className="flex items-center mt-2 text-white/80 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-white/90">
                <div className="text-center">
                  <div className="text-2xl font-bold">{posts.length}</div>
                  <div className="text-xs uppercase tracking-wide">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <div className="text-xs uppercase tracking-wide">
                    Categories
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Posts</p>
                <p className="text-3xl font-black text-gray-900">
                  {posts.length}
                </p>
                <p className="text-islamic-green text-sm font-semibold mt-1">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Active
                </p>
              </div>
              <div className="bg-gradient-to-br from-islamic-green/20 to-emerald-200/40 rounded-xl p-3">
                <FileText className="h-8 w-8 text-islamic-green" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Categories</p>
                <p className="text-3xl font-black text-gray-900">
                  {categories.length}
                </p>
                <p className="text-blue-600 text-sm font-semibold mt-1">
                  <Book className="h-4 w-4 inline mr-1" />
                  Topics
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl p-3">
                <Book className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Featured</p>
                <p className="text-3xl font-black text-gray-900">
                  {posts.filter((post) => post.featured).length}
                </p>
                <p className="text-amber-600 text-sm font-semibold mt-1">
                  <Star className="h-4 w-4 inline mr-1" />
                  Special
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl p-3">
                <Star className="h-8 w-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Languages</p>
                <p className="text-3xl font-black text-gray-900">
                  {
                    new Set(posts.map((post) => post.language || "english"))
                      .size
                  }
                </p>
                <p className="text-purple-600 text-sm font-semibold mt-1">
                  <Users className="h-4 w-4 inline mr-1" />
                  Diverse
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-pink-200 rounded-xl p-3">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 border border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "posts"
                  ? "bg-gradient-to-r from-islamic-green to-emerald-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-islamic-green hover:bg-gray-50"
              }`}
            >
              <FileText className="h-5 w-5 mr-2" />
              Posts Management
              {activeTab === "posts" && (
                <div className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs">
                  {posts.length}
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "categories"
                  ? "bg-gradient-to-r from-islamic-green to-emerald-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-islamic-green hover:bg-gray-50"
              }`}
            >
              <Book className="h-5 w-5 mr-2" />
              Categories
              {activeTab === "categories" && (
                <div className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs">
                  {categories.length}
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("pdfs")}
              className={`flex items-center px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "pdfs"
                  ? "bg-gradient-to-r from-islamic-green to-emerald-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-islamic-green hover:bg-gray-50"
              }`}
            >
              <FileText className="h-5 w-5 mr-2" />
              PDF Library
              {activeTab === "pdfs" && (
                <div className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs">
                  {pdfs.length}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Posts Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    Posts Management
                  </h2>
                  <p className="text-gray-600">
                    Create, edit, and manage your Islamic content
                  </p>
                </div>
                <button
                  onClick={() => setShowPostForm(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-islamic-green to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-islamic-green transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Create New Post</span>
                  <Sparkles className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts by title, content, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-islamic-green focus:border-islamic-green text-sm"
                />
              </div>
            </div>

            {/* Posts List */}
            <div className="p-8">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Posts Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start creating your first Islamic post to share knowledge
                    with the Ummah.
                  </p>
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="flex items-center mx-auto px-6 py-3 bg-islamic-green text-white rounded-xl hover:bg-emerald-600 transition-colors duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Post
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Language
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {posts
                        .filter(
                          (post) =>
                            post.title
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            post.content
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            post.category
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((post) => (
                          <tr
                            key={post.id}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {post.featured && (
                                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                                )}
                                {post.pdfAttachment && (
                                  <FileText
                                    className="h-4 w-4 text-red-600 mr-2"
                                    title="Has PDF attachment"
                                  />
                                )}
                                <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {post.title}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-islamic-green text-white">
                                {post.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                              {post.language || "english"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {post.createdAt
                                ?.toDate?.()
                                ?.toLocaleDateString() || "Recent"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleEditPost(post)}
                                  className="text-islamic-green hover:text-emerald-600 transition-colors duration-200"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {posts.length > 0 &&
                posts.filter(
                  (post) =>
                    post.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    post.content
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    post.category
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Posts Match Your Search
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search terms or browse all posts.
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="inline-flex items-center px-4 py-2 bg-islamic-green text-white rounded-lg hover:bg-emerald-600 transition-colors duration-300"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Categories Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    Categories Management
                  </h2>
                  <p className="text-gray-600">
                    Organize your Islamic content into meaningful categories
                  </p>
                </div>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Create Category</span>
                  <Book className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="p-8">
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Categories Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create categories to organize your Islamic content
                    effectively.
                  </p>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="flex items-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-indigo-600 transition-colors duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Category
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 rounded-lg p-3 mr-4">
                          <Book className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {category.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {category.description || "No description provided"}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Created:{" "}
                          {category.createdAt
                            ?.toDate?.()
                            ?.toLocaleDateString() || "Recently"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDFs Tab */}
        {activeTab === "pdfs" && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* PDFs Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    PDF Library Management
                  </h2>
                  <p className="text-gray-600">
                    View and manage all PDF attachments across your posts
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center bg-red-50 px-4 py-2 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {pdfs.length}
                    </div>
                    <div className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                      Total PDFs
                    </div>
                  </div>
                  <div className="text-center bg-purple-50 px-4 py-2 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(
                        pdfs.reduce(
                          (total, pdf) =>
                            total + (pdf.pdfAttachment?.size || 0),
                          0
                        ) /
                        (1024 * 1024)
                      ).toFixed(1)}
                      MB
                    </div>
                    <div className="text-xs font-semibold text-purple-500 uppercase tracking-wide">
                      Total Size
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search PDFs by filename, post title, or category..."
                  value={pdfSearchTerm}
                  onChange={(e) => setPdfSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>
            </div>

            {/* PDFs List */}
            <div className="p-8">
              {pdfs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No PDFs Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Upload PDFs by creating posts with PDF attachments to build
                    your Islamic library.
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("posts");
                      setShowPostForm(true);
                    }}
                    className="flex items-center mx-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Post with PDF
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          PDF Document
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Associated Post
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Category & Language
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          File Details
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pdfs
                        .filter(
                          (pdf) =>
                            pdf.postTitle
                              .toLowerCase()
                              .includes(pdfSearchTerm.toLowerCase()) ||
                            pdf.pdfAttachment.originalName
                              .toLowerCase()
                              .includes(pdfSearchTerm.toLowerCase()) ||
                            pdf.postCategory
                              .toLowerCase()
                              .includes(pdfSearchTerm.toLowerCase())
                        )
                        .map((pdf) => (
                          <tr
                            key={pdf.id}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="bg-red-100 rounded-lg p-3 mr-4">
                                  <FileText className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {pdf.pdfAttachment?.originalName ||
                                      "Unknown PDF"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {pdf.pdfAttachment?.filename}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {pdf.postTitle}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {pdf.id.substring(0, 8)}...
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-1">
                                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {pdf.postCategory}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                  {pdf.postLanguage || "english"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {pdf.pdfAttachment?.size
                                  ? `${(
                                      pdf.pdfAttachment.size /
                                      (1024 * 1024)
                                    ).toFixed(2)} MB`
                                  : "Size unknown"}
                                {pdf.pdfAttachment?.storageType ===
                                  "metadata_only" && (
                                  <span className="text-xs text-amber-600 block">
                                    (Large file)
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pdf.createdAt
                                  ?.toDate?.()
                                  ?.toLocaleDateString() || "Recently uploaded"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    window.open(`/post/${pdf.id}`, "_blank");
                                  }}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Post
                                </button>
                                <button
                                  onClick={() => {
                                    window.open(
                                      `/pdf/${pdf.pdfAttachment?.filename}`,
                                      "_blank"
                                    );
                                  }}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  View PDF
                                </button>
                                <button
                                  onClick={() =>
                                    handleEditPost(
                                      posts.find((p) => p.id === pdf.id)
                                    )
                                  }
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = `/api/serve-pdf/${pdf.pdfAttachment?.filename}`;
                                    link.download =
                                      pdf.pdfAttachment?.originalName ||
                                      "download.pdf";
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Download
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pdfs.length > 0 &&
                pdfs.filter(
                  (pdf) =>
                    pdf.postTitle
                      .toLowerCase()
                      .includes(pdfSearchTerm.toLowerCase()) ||
                    pdf.pdfAttachment.originalName
                      .toLowerCase()
                      .includes(pdfSearchTerm.toLowerCase()) ||
                    pdf.postCategory
                      .toLowerCase()
                      .includes(pdfSearchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No PDFs Match Your Search
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search terms or browse all PDFs.
                    </p>
                    <button
                      onClick={() => setPdfSearchTerm("")}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-islamic-green to-emerald-600 px-8 py-6 text-white sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    {editingPost ? (
                      <Edit className="h-6 w-6" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">
                      {editingPost ? "Edit Post" : "Create New Post"}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {editingPost
                        ? "Update your Islamic content"
                        : "Share knowledge with the Ummah"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetPostForm}
                  className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <form onSubmit={handlePostSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-islamic-green transition-all duration-200 text-lg"
                      placeholder="Enter an inspiring title..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-islamic-green transition-all duration-200"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={postLanguage}
                        onChange={(e) => setPostLanguage(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-islamic-green transition-all duration-200"
                      >
                        <option value="english">English</option>
                        <option value="arabic">Arabic</option>
                        <option value="urdu">Urdu</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={postFeatured}
                        onChange={(e) => setPostFeatured(e.target.checked)}
                        className="h-5 w-5 text-islamic-green focus:ring-islamic-green border-gray-300 rounded"
                      />
                      <label
                        htmlFor="featured"
                        className="ml-3 block text-sm font-bold text-gray-900"
                      >
                        Featured Post
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-bold text-gray-700">
                      Content *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center px-4 py-2 text-sm text-islamic-green hover:text-emerald-600 font-semibold bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                  </div>

                  <AdminTextHelper />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                        Editor
                      </label>
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        rows={16}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-islamic-green focus:border-islamic-green resize-vertical font-mono text-sm transition-all duration-200"
                        placeholder="Enter post content. Use ///quran text ///, ///hadith text ///, ///urdu text /// for special formatting."
                        required
                      />
                    </div>

                    {showPreview && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                          Live Preview
                        </label>
                        <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 min-h-[400px] max-h-[500px] overflow-y-auto">
                          <IslamicTextRenderer text={postContent} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF Attachment Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-bold text-gray-700">
                      PDF Attachment (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/test-upload");
                          const result = await response.json();
                          console.log("Environment test:", result);
                          toast.success(`Environment: ${result.environment}`);
                        } catch (error) {
                          console.error("Test failed:", error);
                          toast.error("Test failed");
                        }
                      }}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Test Environment
                    </button>
                  </div>

                  {!postPdf ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-islamic-green transition-colors duration-200">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file && file.type === "application/pdf") {
                            setPdfUploading(true);
                            console.log("Starting PDF upload:", {
                              fileName: file.name,
                              fileSize: file.size,
                              fileType: file.type,
                            });

                            try {
                              const formData = new FormData();
                              formData.append("pdf", file);

                              console.log("Sending upload request...");
                              const response = await fetch("/api/upload-pdf", {
                                method: "POST",
                                body: formData,
                              });

                              console.log(
                                "Upload response status:",
                                response.status
                              );
                              const result = await response.json();
                              console.log("Upload result:", result);

                              if (result.success) {
                                // Store the complete result including base64 content for Vercel
                                setPostPdf(result);
                                toast.success(
                                  `PDF uploaded successfully! (${result.environment})`
                                );
                              } else {
                                console.error("Upload failed:", result);
                                toast.error(result.error || "Upload failed");
                              }
                            } catch (error) {
                              console.error("Upload error:", error);
                              toast.error(
                                "Failed to upload PDF: " + error.message
                              );
                            } finally {
                              setPdfUploading(false);
                            }
                          } else {
                            toast.error("Please select a PDF file");
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={pdfUploading}
                      />

                      {pdfUploading ? (
                        <div className="space-y-3">
                          <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                          <p className="text-blue-600 font-medium">
                            Uploading PDF...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">
                              Upload PDF Document
                            </p>
                            <p className="text-gray-500 text-sm">
                              Click to browse or drag and drop
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              Maximum file size: 50MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 rounded-lg p-2">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-900">
                              {postPdf.originalName}
                            </p>
                            <p className="text-green-700 text-sm">
                              {(postPdf.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={postPdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Preview
                          </a>
                          <button
                            type="button"
                            onClick={() => setPostPdf(null)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-gray-500 text-xs mt-2">
                    PDF will be embedded in the post and available for download
                    by readers
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetPostForm}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-islamic-green to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-islamic-green transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {editingPost ? "Update Post" : "Create Post"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <Book className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Create New Category</h3>
                    <p className="text-white/80 text-sm">
                      Organize your Islamic content effectively
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoryForm(false)}
                  className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <form onSubmit={handleCategorySubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-lg"
                    placeholder="e.g., Quran, Hadith, Islamic History..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-vertical transition-all duration-200"
                    placeholder="Describe what this category covers..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
