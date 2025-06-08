import Head from "next/head";

export default function FaviconHead() {
  return (
    <Head>
      {/* Primary Favicon */}
      <link rel="icon" href="/fevicon.png" />
      <link rel="shortcut icon" href="/fevicon.png" />

      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" href="/logo.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />

      {/* Android Chrome Icons */}
      <link rel="icon" type="image/png" sizes="192x192" href="/fevicon.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/fevicon.png" />

      {/* Standard Favicon Sizes */}
      <link rel="icon" type="image/png" sizes="16x16" href="/fevicon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/fevicon.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/fevicon.png" />

      {/* Web App Manifest */}
      <link rel="manifest" href="/site.webmanifest" />

      {/* Theme Colors */}
      <meta name="theme-color" content="#047857" />
      <meta name="msapplication-TileColor" content="#047857" />
      <meta name="msapplication-TileImage" content="/logo.png" />

      {/* Safari Pinned Tab */}
      <link rel="mask-icon" href="/fevicon.png" color="#047857" />

      {/* Open Graph Image */}
      <meta property="og:image" content="/logo.png" />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:type" content="image/png" />

      {/* Twitter Card */}
      <meta name="twitter:image" content="/logo.png" />
      <meta name="twitter:card" content="summary" />

      {/* Additional Meta Tags */}
      <meta name="application-name" content="Islamic Studies" />
      <meta name="apple-mobile-web-app-title" content="Islamic Studies" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
    </Head>
  );
}
