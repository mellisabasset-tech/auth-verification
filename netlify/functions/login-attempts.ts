import { supabaseStorage } from "../../server/storage-supabase";
import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { insertLoginAttemptSchema } from "../../shared/schema";

const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      
      try {
        const validatedData = insertLoginAttemptSchema.parse(body);
        const attempt = await supabaseStorage.logLoginAttempt(validatedData);
        
        return {
          statusCode: 200,
          body: JSON.stringify(attempt),
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid data", errors: error.errors }),
          };
        }
        throw error;
      }
    } else if (event.httpMethod === "GET") {
      const attempts = await supabaseStorage.getLoginAttempts();
      return {
        statusCode: 200,
        body: JSON.stringify(attempts),
      };
    } else if (event.httpMethod === "DELETE") {
      await supabaseStorage.clearLoginAttempts();
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "All login attempts cleared" }),
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
      body: JSON.stringify({ message: "Failed to process request" }),
    };
  }
};

export { handler };
