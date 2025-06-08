import {
  initializeDatabase,
  checkDatabaseStatus,
} from "../../lib/database-init";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use POST.",
    });
  }

  try {
    // Check current database status first
    const currentStatus = await checkDatabaseStatus();

    if (!currentStatus.isEmpty) {
      return res.status(200).json({
        success: true,
        message: "Database already has data",
        status: currentStatus,
        action: "skipped",
      });
    }

    // Initialize the database
    const result = await initializeDatabase();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Database initialized successfully",
        status: result.status,
        action: "initialized",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: result.error?.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Database initialization API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize database",
      error: error.message,
    });
  }
}
