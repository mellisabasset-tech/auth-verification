import { supabaseStorage } from "./supabase-storage.mjs";
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      await supabaseStorage.saveSecondCodeData(body);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Second code data saved" }),
      };
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to save second code data" }),
    };
  }
};

export { handler };
