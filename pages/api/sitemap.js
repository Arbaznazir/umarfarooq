import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { config } from "../../lib/config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Fetch all posts and categories
    const [postsSnapshot, categoriesSnapshot] = await Promise.all([
      getDocs(collection(db, "posts")),
      getDocs(collection(db, "categories")),
    ]);

    const posts = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const baseUrl = config.app.url;
    const currentDate = new Date().toISOString();

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${categories
    .map(
      (category) => `
  <url>
    <loc>${baseUrl}/category/${category.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}
  ${posts
    .map((post) => {
      const lastmod = post.updatedAt
        ? (post.updatedAt.toDate
            ? post.updatedAt.toDate()
            : new Date(post.updatedAt)
          ).toISOString()
        : currentDate;
      return `
  <url>
    <loc>${baseUrl}/post/${post.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join("")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600"); // Cache for 1 hour
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).json({ message: "Error generating sitemap" });
  }
}
