import { supabaseStorage } from "../../server/storage-supabase";
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      await supabaseStorage.savePasswordData(body);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Password data saved" }),
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
      body: JSON.stringify({ message: "Failed to save password data" }),
    };
  }
};

export { handler };
