export type CategoryType = 'beauty' | 'cleaning' | 'household' | 'health' | 'personal_care';

export interface RecipeIngredient {
  name: string;
  amount: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  category: CategoryType;
  description: string;
  prepTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  costEstimate: string;
  retailCostCost: string;
  chemicalsAvoided: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  safetyNote: string;
  shelfLife: string;
  tips: string[];
  rating?: number;
  isCustom?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  description: string;
  safetyLevel: 'excellent' | 'safe' | 'handle_with_care';
  safetyDescription: string;
  commonUses: string[];
  properties?: string[];
}

export interface FormulationRequest {
  targetProduct: string;
  ingredientsAvailable: string[];
  extraNotes?: string;
}

export interface ChemicalImpact {
  id: string;
  name: string;
  type: string;
  hazards: string;
  whyAvoid: string;
  score: number; // 1-10 toxicity score
}

export interface SavedRecipe extends Recipe {
  savedAt: string;
  personalNotes?: string;
  collections?: string[];
}
