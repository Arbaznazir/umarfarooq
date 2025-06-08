import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Sample Islamic categories for production
const SAMPLE_CATEGORIES = [
  {
    name: "Quran",
    description:
      "Quranic verses, interpretations, and teachings from the Holy Quran",
    slug: "quran",
    order: 1,
  },
  {
    name: "Hadith",
    description: "Authentic Hadith collections and their explanations",
    slug: "hadith",
    order: 2,
  },
  {
    name: "Islamic History",
    description:
      "Stories and lessons from Islamic history and the lives of the Prophets",
    slug: "islamic-history",
    order: 3,
  },
  {
    name: "Fiqh",
    description: "Islamic jurisprudence and practical guidance for daily life",
    slug: "fiqh",
    order: 4,
  },
  {
    name: "Aqeedah",
    description: "Islamic beliefs, theology, and matters of faith",
    slug: "aqeedah",
    order: 5,
  },
  {
    name: "Dua & Dhikr",
    description: "Supplications, remembrance of Allah, and spiritual practices",
    slug: "dua-dhikr",
    order: 6,
  },
  {
    name: "Islamic Ethics",
    description: "Moral guidance and character development in Islam",
    slug: "islamic-ethics",
    order: 7,
  },
  {
    name: "Ramadan & Hajj",
    description: "Guidance for the holy months and pilgrimage",
    slug: "ramadan-hajj",
    order: 8,
  },
];

// Sample posts for production
const SAMPLE_POSTS = [
  {
    title: "Welcome to Islamic Studies",
    content: `Assalamu Alaikum wa Rahmatullahi wa Barakatuh,

Welcome to our Islamic Studies website. This platform is dedicated to sharing authentic Islamic knowledge, Quranic interpretations, and Hadith discussions.

Our mission is to provide accessible Islamic education for Muslims around the world, helping them strengthen their faith and understanding of Islam.

May Allah (SWT) bless this endeavor and make it a source of benefit for the Ummah.

Barakallahu feekum.`,
    category: "Islamic Ethics",
    language: "english",
    featured: true,
    published: true,
    slug: "welcome-to-islamic-studies",
  },
  {
    title: "The Importance of Daily Prayers (Salah)",
    content: `Prayer (Salah) is the second pillar of Islam and one of the most important acts of worship for Muslims.

Allah (SWT) says in the Quran: "And establish prayer and give zakah and bow with those who bow." (Quran 2:43)

The five daily prayers are:
1. Fajr (Dawn Prayer)
2. Dhuhr (Midday Prayer) 
3. Asr (Afternoon Prayer)
4. Maghrib (Sunset Prayer)
5. Isha (Night Prayer)

Each prayer is a direct connection with Allah (SWT) and serves as a reminder of our purpose in life.

May Allah help us all maintain our prayers consistently.`,
    category: "Fiqh",
    language: "english",
    featured: true,
    published: true,
    slug: "importance-of-daily-prayers",
  },
  {
    title: "Seeking Knowledge in Islam",
    content: `The Prophet Muhammad (peace be upon him) said: "Seek knowledge from the cradle to the grave."

Islam places great emphasis on seeking knowledge. The very first revelation to Prophet Muhammad (PBUH) began with "Read" (Iqra).

Types of beneficial knowledge in Islam:
- Knowledge of the Quran and Sunnah
- Understanding of Islamic jurisprudence (Fiqh)
- Knowledge that benefits humanity
- Sciences that help us understand Allah's creation

Every Muslim should strive to gain knowledge throughout their life, as it brings us closer to Allah (SWT) and helps us serve humanity better.`,
    category: "Islamic Ethics",
    language: "english",
    featured: true,
    published: true,
    slug: "seeking-knowledge-in-islam",
  },
  {
    title: "The Beautiful Names of Allah (Asma ul Husna)",
    content: `Allah (SWT) has 99 beautiful names mentioned in the Quran and Sunnah. These names describe His perfect attributes and qualities.

Some of the most commonly recited names include:
- Ar-Rahman (The Most Merciful)
- Ar-Raheem (The Most Compassionate)
- Al-Malik (The King)
- Al-Quddus (The Most Holy)
- As-Sabur (The Most Patient)

The Prophet (PBUH) said: "Allah has ninety-nine names, whoever memorizes them will enter Paradise."

Reflecting on these names helps us understand Allah's greatness and develop a stronger relationship with Him.`,
    category: "Aqeedah",
    language: "english",
    featured: false,
    published: true,
    slug: "beautiful-names-of-allah",
  },
  {
    title: "The Month of Ramadan: A Time for Spiritual Renewal",
    content: `Ramadan is the ninth month of the Islamic lunar calendar and is considered the holiest month for Muslims worldwide.

During this blessed month, Muslims:
- Fast from dawn to sunset
- Increase their prayers and Quran recitation
- Give charity (Zakat) and help the needy
- Seek forgiveness and spiritual purification

The Quran was first revealed during this month, making it even more special. The last ten nights of Ramadan include Laylat al-Qadr (Night of Power), which is better than a thousand months.

May Allah allow us all to witness many more blessed Ramadans and accept our worship.`,
    category: "Ramadan & Hajj",
    language: "english",
    featured: false,
    published: true,
    slug: "month-of-ramadan-spiritual-renewal",
  },
  {
    title: "سورة الفاتحة - أم الكتاب",
    content: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
الرَّحْمَٰنِ الرَّحِيمِ
مَالِكِ يَوْمِ الدِّينِ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ

سورة الفاتحة هي أعظم سورة في القرآن الكريم، وتُسمى أيضاً "أم الكتاب" و"السبع المثاني". هذه السورة المباركة تحتوي على جميع معاني القرآن الكريم في سبع آيات عظيمة.

قال رسول الله صلى الله عليه وسلم: "والذي نفسي بيده ما أنزلت في التوراة ولا في الإنجيل ولا في الزبور ولا في الفرقان مثلها، وإنها سبع من المثاني والقرآن العظيم الذي أوتيته"

تبدأ السورة بالبسملة، ثم الحمد والثناء على الله رب العالمين، وتنتهي بالدعاء بالهداية إلى الصراط المستقيم.`,
    category: "Quran",
    language: "arabic",
    featured: true,
    published: true,
    slug: "surah-al-fatiha-mother-of-book",
  },
  {
    title: "آية الكرسي - أعظم آية في القرآن",
    content: `اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ

هذه الآية الكريمة هي أعظم آية في كتاب الله تعالى، كما أخبر بذلك النبي صلى الله عليه وسلم. تحتوي على أسماء الله الحسنى وصفاته العليا، وتبين عظمة الله سبحانه وتعالى وقدرته المطلقة.

قال رسول الله صلى الله عليه وسلم لأبي بن كعب: "يا أبا المنذر، أتدري أي آية من كتاب الله معك أعظم؟" قال: قلت: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ. قال: فضرب في صدري وقال: "والله ليهنك العلم أبا المنذر"

من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت.`,
    category: "Quran",
    language: "arabic",
    featured: true,
    published: true,
    slug: "ayat-al-kursi-greatest-verse",
  },
  {
    title: "The Importance of Prayer - Hadith and Quranic Guidance",
    content: `Prayer (Salah) is the cornerstone of Islamic worship and the second pillar of Islam. Let us explore what the Quran and authentic Hadith teach us about this fundamental act of worship.

///quran إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ///

"Indeed, prayer has been decreed upon the believers a decree of specified times." (Quran 4:103)

The Prophet Muhammad (peace be upon him) emphasized the critical importance of prayer in numerous authentic Hadith:

///hadith قال رسول الله صلى الله عليه وسلم: "العهد الذي بيننا وبينهم الصلاة، فمن تركها فقد كفر" رواه الترمذي ///

The Messenger of Allah (peace be upon him) said: "The covenant between us and them is prayer; whoever abandons it has committed disbelief." (Narrated by At-Tirmidhi)

Another important Hadith about the timing of prayers:

///hadith عن عبد الله بن عمرو رضي الله عنهما قال: قال رسول الله صلى الله عليه وسلم: "وقت الظهر إذا زالت الشمس وكان ظل الرجل كطوله ما لم يحضر العصر" رواه مسلم ///

The five daily prayers are a direct connection between the believer and Allah (SWT), providing spiritual nourishment and guidance throughout the day.

May Allah help us all maintain our prayers with devotion and consistency.`,
    category: "Hadith",
    language: "english",
    featured: true,
    published: true,
    slug: "importance-of-prayer-hadith-quran",
  },
  {
    title: "نماز کی اہمیت - قرآن و حدیث کی روشنی میں",
    content: `نماز اسلام کا دوسرا رکن ہے اور مومن کے لیے انتہائی اہم عبادت ہے۔

///quran وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ ///

"اور نماز قائم کرو اور زکوٰۃ دو اور رکوع کرنے والوں کے ساتھ رکوع کرو۔" (البقرہ: 43)

///urdu نماز مومن کی معراج ہے اور اللہ تعالیٰ سے براہ راست رابطہ کا ذریعہ ہے۔ ///

رسول اللہ صلی اللہ علیہ وسلم نے فرمایا:

///hadith قال رسول الله صلى الله عليه وسلم: "الصلاة عماد الدين، من أقامها فقد أقام الدين، ومن هدمها فقد هدم الدين" ///

///urdu "نماز دین کا ستون ہے، جس نے اسے قائم کیا اس نے دین قائم کیا، اور جس نے اسے گرایا اس نے دین گرایا۔" ///

ہمیں چاہیے کہ ہم اپنی نمازوں کا خاص خیال رکھیں اور وقت پر ادا کریں۔

اللہ تعالیٰ ہم سب کو نماز کی پابندی کی توفیق عطا فرمائے۔ آمین۔`,
    category: "Hadith",
    language: "urdu",
    featured: true,
    published: true,
    slug: "namaz-ki-ahmiyat-quran-hadith",
  },
];

// Check if data already exists
export const checkDatabaseStatus = async () => {
  try {
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    const postsSnapshot = await getDocs(collection(db, "posts"));

    return {
      categoriesCount: categoriesSnapshot.size,
      postsCount: postsSnapshot.size,
      isEmpty: categoriesSnapshot.size === 0 && postsSnapshot.size === 0,
    };
  } catch (error) {
    console.error("Error checking database status:", error);
    return { categoriesCount: 0, postsCount: 0, isEmpty: true };
  }
};

// Initialize categories
export const initializeCategories = async () => {
  try {
    console.log("🏗️ Initializing categories...");

    for (const category of SAMPLE_CATEGORIES) {
      // Check if category already exists
      const existingQuery = query(
        collection(db, "categories"),
        where("name", "==", category.name)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        await addDoc(collection(db, "categories"), {
          ...category,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️ Category already exists: ${category.name}`);
      }
    }

    console.log("✅ Categories initialization completed");
    return true;
  } catch (error) {
    console.error("❌ Error initializing categories:", error);
    return false;
  }
};

// Initialize posts
export const initializePosts = async () => {
  try {
    console.log("📝 Initializing posts...");

    for (const post of SAMPLE_POSTS) {
      // Check if post already exists
      const existingQuery = query(
        collection(db, "posts"),
        where("title", "==", post.title)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        await addDoc(collection(db, "posts"), {
          ...post,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`✅ Created post: ${post.title}`);
      } else {
        console.log(`⏭️ Post already exists: ${post.title}`);
      }
    }

    console.log("✅ Posts initialization completed");
    return true;
  } catch (error) {
    console.error("❌ Error initializing posts:", error);
    return false;
  }
};

// Full database initialization
export const initializeDatabase = async () => {
  try {
    console.log("🚀 Starting database initialization...");

    const status = await checkDatabaseStatus();
    console.log(`📊 Current database status:`, status);

    if (!status.isEmpty) {
      console.log("ℹ️ Database already has data. Skipping initialization.");
      return {
        success: true,
        message: "Database already initialized",
        status,
      };
    }

    // Initialize categories first
    const categoriesSuccess = await initializeCategories();
    if (!categoriesSuccess) {
      throw new Error("Failed to initialize categories");
    }

    // Then initialize posts
    const postsSuccess = await initializePosts();
    if (!postsSuccess) {
      throw new Error("Failed to initialize posts");
    }

    const finalStatus = await checkDatabaseStatus();

    console.log("🎉 Database initialization completed successfully!");
    console.log(`📊 Final status:`, finalStatus);

    return {
      success: true,
      message: "Database initialized successfully",
      status: finalStatus,
    };
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return {
      success: false,
      message: error.message,
      error,
    };
  }
};

// Auto-initialize on import (for production)
export const autoInitialize = async () => {
  if (typeof window === "undefined") {
    // Only run on server-side
    return;
  }

  try {
    const status = await checkDatabaseStatus();
    if (status.isEmpty) {
      console.log("🔄 Auto-initializing empty database...");
      await initializeDatabase();
    }
  } catch (error) {
    console.log("ℹ️ Auto-initialization skipped:", error.message);
  }
};
