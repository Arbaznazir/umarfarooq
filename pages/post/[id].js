import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ArrowLeft, Calendar, Book, Star } from "lucide-react";
import { QuranicContent } from "../../components/QuranicText";
import IslamicTextRenderer from "../../components/IslamicTextRenderer";

export default function PostPage() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const postDoc = await getDoc(doc(db, "posts", id));
      if (postDoc.exists()) {
        setPost({
          id: postDoc.id,
          ...postDoc.data(),
        });
      } else {
        router.push("/404");
      }
    } catch (error) {
      // Error fetching post
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Post not found
          </h1>
          <Link href="/" className="text-islamic-green hover:text-green-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{post.title} - Umar Farooq Al Madani</title>
        <meta name="description" content={post.content.substring(0, 160)} />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Post Header */}
          <div className="px-6 py-8">
            <div className="flex items-center mb-4">
              {post.featured && (
                <div className="flex items-center mr-4">
                  <Star className="h-5 w-5 text-islamic-gold mr-1" />
                  <span className="text-sm text-islamic-gold font-medium">
                    Featured
                  </span>
                </div>
              )}
              <span className="inline-block bg-islamic-green text-white text-sm px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center text-gray-500 text-sm mb-8">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {post.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) || "Recently published"}
              </span>
            </div>

            {/* Bismillah for Islamic content */}
            <div className="text-center mb-8 py-6 border-y border-gray-200">
              <h2 className="text-2xl md:text-3xl quranic-text text-islamic-green font-semibold mb-2">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </h2>
              <p className="text-gray-600 italic">
                In the name of Allah, the Most Gracious, the Most Merciful
              </p>
            </div>

            {/* Post Content */}
            <div className="prose prose-lg max-w-none">
              <IslamicTextRenderer
                text={post.content}
                className="text-lg leading-relaxed"
              />
            </div>
          </div>

          {/* Post Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Book className="h-5 w-5 text-islamic-green mr-2" />
                <span className="text-sm text-gray-600">
                  Category: <span className="font-medium">{post.category}</span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Language:{" "}
                  <span className="font-medium capitalize">
                    {post.language}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </article>

        {/* Islamic Footer Quote */}
        <div className="mt-12 text-center py-8">
          <div className="max-w-2xl mx-auto">
            <p className="quranic-text text-xl text-islamic-green mb-3">
              رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً
              وَقِنَا عَذَابَ النَّارِ
            </p>
            <p className="text-gray-600 italic">
              "Our Lord, give us good in this world and good in the next world,
              and save us from the punishment of the Fire."
            </p>
            <p className="text-sm text-gray-500 mt-2">- Quran 2:201</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-islamic-dark text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-xl font-bold mb-2 arabic-text">
            عمر فاروق المدنی
          </h4>
          <p className="text-gray-300">
            May Allah bless this knowledge and make it beneficial
          </p>
        </div>
      </footer>
    </div>
  );
}
