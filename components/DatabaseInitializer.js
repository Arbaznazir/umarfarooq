import { useEffect, useState } from "react";
import { checkDatabaseStatus } from "../lib/database-init";

export default function DatabaseInitializer() {
  const [initStatus, setInitStatus] = useState("checking");
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeIfNeeded();
  }, []);

  const initializeIfNeeded = async () => {
    try {
      // Check if database needs initialization
      const status = await checkDatabaseStatus();

      if (status.isEmpty) {
        setInitStatus("initializing");

        // Call the API to initialize the database
        const response = await fetch("/api/init-database", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (result.success) {
          setInitStatus("completed");
          console.log("✅ Database initialized successfully:", result);
        } else {
          setInitStatus("error");
          setError(result.message);
          console.error("❌ Database initialization failed:", result);
        }
      } else {
        setInitStatus("already-initialized");
        console.log("ℹ️ Database already has data:", status);
      }
    } catch (error) {
      setInitStatus("error");
      setError(error.message);
      console.error("❌ Database initialization error:", error);
    }
  };

  // Don't render anything in production - this runs silently
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // Show status only in development
  if (initStatus === "checking" || initStatus === "already-initialized") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {initStatus === "initializing" && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Initializing database...
        </div>
      )}

      {initStatus === "completed" && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          ✅ Database initialized successfully!
        </div>
      )}

      {initStatus === "error" && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          ❌ Database initialization failed: {error}
        </div>
      )}
    </div>
  );
}
