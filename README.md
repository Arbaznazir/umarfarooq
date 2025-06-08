# Umar Farooq Al Madani - Islamic Studies Website

A beautiful, responsive Islamic studies website built with Next.js, Tailwind CSS, and Firebase. This platform allows Umar Farooq Al Madani to share Islamic content including Quranic translations, Hadith discussions, and other Islamic teachings.

## Features

- **Beautiful Islamic Design**: Clean, modern interface with Islamic color scheme
- **Multilingual Support**: Full support for Arabic, Urdu, and English with proper fonts
- **Content Management**: Admin panel for creating and managing posts and categories
- **Categories System**: Organize content by topics (Quran, Hadith, etc.)
- **Featured Posts**: Highlight important content on the homepage
- **Responsive Design**: Works perfectly on all devices
- **Real-time Database**: Firebase Firestore for instant updates
- **Authentication**: Secure admin login system

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Database**: Firebase Firestore (100% free)
- **Authentication**: Firebase Auth
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Noto Arabic, Noto Urdu)
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication > Email/Password
5. Get your config from Project Settings > General > Your apps

### 3. Configure Firebase

Update `lib/firebase.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

### 4. Create Admin User

In Firebase Console > Authentication, add a user with email/password that will be used for admin access.

### 5. Firestore Security Rules

In Firebase Console > Firestore > Rules, set up these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to posts and categories for everyone
    match /{collection}/{document} {
      allow read;
    }

    // Allow write access only for authenticated users (admin)
    match /{collection}/{document} {
      allow write: if request.auth != null;
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Usage

### Admin Panel

1. Visit `/admin` to access the admin login
2. Login with your Firebase auth credentials
3. Create categories first (e.g., "Quran", "Hadith", "Islamic History")
4. Create posts and assign them to categories
5. Mark important posts as "Featured" to show them on homepage

### Content Creation

- **Title**: Enter the post title
- **Content**: Write the full content (supports line breaks)
- **Category**: Select from existing categories
- **Language**: Choose Arabic, Urdu, or English for proper font rendering
- **Featured**: Check to display on homepage featured section

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy
4. Add your environment variables in Vercel dashboard if needed

### Firebase Hosting (Alternative)

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Customization

### Colors

Update Islamic colors in `tailwind.config.js`:

```javascript
colors: {
  islamic: {
    green: '#047857',  // Main Islamic green
    gold: '#d97706',   // Gold accent
    dark: '#1f2937',   // Dark backgrounds
  }
}
```

### Fonts

Arabic and Urdu fonts are configured in `styles/globals.css`. You can change them by updating the Google Fonts imports and CSS classes.

### Content

- Update the website title and description in each page's `<Head>` component
- Modify Islamic quotes and verses in the footer sections
- Add your own Quranic verses and Hadith in the hero sections

## Database Structure

### Collections

**categories**

```
{
  name: "Quran",
  description: "Quranic verses and interpretations",
  createdAt: timestamp
}
```

**posts**

```
{
  title: "Understanding Surah Al-Fatiha",
  content: "Full post content...",
  category: "Quran",
  language: "english", // "arabic", "urdu", "english"
  featured: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Contributing

This is a personal website for Umar Farooq Al Madani. If you'd like to suggest improvements or report issues, please create an issue or contact the maintainer.

## License

This project is for educational and religious purposes. Please respect Islamic content and use responsibly.

## Support

For technical support or questions about Islamic content, please contact through the appropriate channels.

---

**May Allah bless this work and make it beneficial for the Ummah. Ameen.**

بارك الله فيكم
