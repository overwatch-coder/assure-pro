import fs from 'fs';
import path from 'path';

// Define types based on our data.json structure
export type Role = 'ADMIN' | 'ADVISOR';
export type Status = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'CLOSED';
export type Product = 'AUTO' | 'MRH' | 'RCPRO';

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

const dbPath = path.join(process.cwd(), 'lib', 'data.json');

export function getDb(): Database {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data) as Database;
}

export function saveDb(data: Database): void {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}
