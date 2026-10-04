export type Alert = {
  type: string;
  severity: 'info' | 'warn' | 'danger';
  message: string;
};

export type MealItem = {
  name: string;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type ScanResult = {
  id: string;
  source: 'barcode' | 'label_photo' | 'meal_photo';
  product_name: string | null;
  nutrients_per_100g: {
    energy_kcal: number | null;
    fat_g: number | null;
    saturated_fat_g: number | null;
    carbs_g: number | null;
    sugars_g: number | null;
    fiber_g: number | null;
    protein_g: number | null;
    salt_g: number | null;
  } | null;
  ingredients: string | null;
  items: MealItem[] | null;
  alerts: Alert[];
  confidence: 'low' | 'medium' | 'high';
  created_at: string;
};