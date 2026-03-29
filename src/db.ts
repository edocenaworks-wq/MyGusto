import Dexie, { type Table } from 'dexie';

export interface Recipe {
  id?: number;
  title: string;
  ingredients: string[];
  instructions: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  cookingInfo?: string; // e.g. temperature, oven mode, etc.
  image?: string; // base64 or local path
  createdAt: number;
  updatedAt: number;
  checkedIngredients?: number[]; // indices of checked ingredients
}

export class MyGustoDB extends Dexie {
  recipes!: Table<Recipe>;

  constructor() {
    super('MyGustoDB');
    this.version(2).stores({
      recipes: '++id, title, createdAt'
    }).upgrade(tx => {
      return tx.table('recipes').toCollection().modify(recipe => {
        recipe.checkedIngredients = [];
      });
    });
  }
}

export const db = new MyGustoDB();
