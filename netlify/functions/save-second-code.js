const { supabaseStorage } = require("../../server/storage-supabase");

exports.handler = async (event, context) => {
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
