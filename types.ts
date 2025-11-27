export interface NutritionData {
  protein: number; // Score 0-100 representing balance/proportion
  carbs: number;   // Score 0-100
  fat: number;     // Score 0-100
  vitamins: number; // Score 0-100
  minerals: number; // Score 0-100
  proteinGrams: number; // Estimated quantity in grams
  carbsGrams: number;   // Estimated quantity in grams
  fatGrams: number;     // Estimated quantity in grams
}

export interface MenuItem {
  name: string;
  calories: number;
  description: string;
  nutrition: NutritionData;
  healthRating: 'A' | 'B' | 'C' | 'D'; // A simple rating system
}

export interface MenuAnalysisResult {
  items: MenuItem[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}