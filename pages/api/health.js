import { db } from "../../lib/firebase";
import { collection, limit, getDocs, query } from "firebase/firestore";
import { config } from "../../lib/config";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const startTime = Date.now();
  const checks = {
    database: false,
    environment: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check environment variables
    checks.environment = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );

    // Check database connection
    try {
      const testQuery = query(collection(db, "posts"), limit(1));
      await getDocs(testQuery);
      checks.database = true;
    } catch (dbError) {
      console.error("Database health check failed:", dbError);
      checks.database = false;
    }

    const responseTime = Date.now() - startTime;
    const isHealthy = checks.database && checks.environment;

    const response = {
      status: isHealthy ? "healthy" : "unhealthy",
      version: "1.0.0",
      environment: config.isProduction ? "production" : "development",
      checks,
      responseTime: `${responseTime}ms`,
      uptime: process.uptime(),
    };

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(isHealthy ? 200 : 503).json(response);
  } catch (error) {
    console.error("Health check error:", error);

    const response = {
      status: "unhealthy",
      version: "1.0.0",
      environment: config.isProduction ? "production" : "development",
      checks,
      error: config.isDevelopment ? error.message : "Internal server error",
      responseTime: `${Date.now() - startTime}ms`,
    };

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(503).json(response);
  }
}
