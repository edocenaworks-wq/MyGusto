import Dexie, { type Table } from 'dexie';

export interface Recipe {
  id?: number;
  title: string;
  ingredients: string[];
  instructions: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  image?: string; // base64 or local path
  createdAt: number;
  updatedAt: number;
}

export class MyGustoDB extends Dexie {
  recipes!: Table<Recipe>;

  constructor() {
    super('MyGustoDB');
    this.version(1).stores({
      recipes: '++id, title, createdAt' // index by id, title and date
    });
  }
}

export const db = new MyGustoDB();
