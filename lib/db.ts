import fs from "fs";
import path from "path";

export type Role = "ADMIN" | "ADVISOR";
export type Status = "NEW" | "ASSIGNED" | "IN_PROGRESS" | "CLOSED";
export type Product = "AUTO" | "MRH" | "RCPRO";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
}

export interface Fiche {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  product: Product;
  status: Status;
  advisorId: string | null;
  type: string;
  garanties: string[];
  prime: number;
  createdAt: string;
}

export interface Database {
  users: User[];
  fiches: Fiche[];
}

const dbPath = path.join(process.cwd(), "lib", "data.json");

let cachedDb: Database | null = null;

export function getDb(): Database {
  if (!cachedDb) {
    try {
      const data = fs.readFileSync(dbPath, "utf-8");
      cachedDb = JSON.parse(data) as Database;
    } catch {
      cachedDb = { users: [], fiches: [] };
    }
  }
  return JSON.parse(JSON.stringify(cachedDb));
}

export function saveDb(data: Database): void {
  cachedDb = JSON.parse(JSON.stringify(data));

  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    console.warn("File system is read-only. Data is saved in memory only");
  }
}
