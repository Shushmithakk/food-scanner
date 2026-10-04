import { Alert, ScanResult } from '../types/scan';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const num = (v: unknown): number | null => (typeof v === 'number' ? v : null);

// Temporary alert rules, so the screen has something to show.
// The proper dietary-profile logic comes on Day 4.
function makeAlerts(n: {
  sugars_g: number | null; salt_g: number | null;
  saturated_fat_g: number | null; fat_g: number | null;
}): Alert[] {
  const alerts: Alert[] = [];
  if ((n.sugars_g ?? 0) > 22.5)
    alerts.push({ type: 'sugar', severity: 'danger', message: 'High sugar' });
  if ((n.salt_g ?? 0) > 1.5)
    alerts.push({ type: 'salt', severity: 'danger', message: 'High salt' });
  if ((n.saturated_fat_g ?? 0) > 5)
    alerts.push({ type: 'sat_fat', severity: 'warn', message: 'High saturated fat' });
  if ((n.fat_g ?? 0) > 17.5)
    alerts.push({ type: 'fat', severity: 'warn', message: 'High fat' });
  return alerts;
}

export async function scanBarcode(barcode: string): Promise<ScanResult> {
  const url =
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json` +
    `?fields=product_name,nutriments,ingredients_text`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'FoodScannerCapstone/0.1 (student project)' },
  });
  const data = await res.json();

  if (data.status !== 1 || !data.product) {
    return {
      id: 'notfound-' + barcode,
      source: 'barcode',
      product_name: null,
      nutrients_per_100g: null,
      ingredients: null,
      items: null,
      alerts: [{ type: 'info', severity: 'info', message: 'Product not found in the database. Try photographing the label.' }],
      confidence: 'low',
      created_at: new Date().toISOString(),
    };
  }

  const p = data.product;
  const m = p.nutriments ?? {};
  const nutrients = {
    energy_kcal: num(m['energy-kcal_100g']),
    fat_g: num(m['fat_100g']),
    saturated_fat_g: num(m['saturated-fat_100g']),
    carbs_g: num(m['carbohydrates_100g']),
    sugars_g: num(m['sugars_100g']),
    fiber_g: num(m['fiber_100g']),
    protein_g: num(m['proteins_100g']),
    salt_g: num(m['salt_100g']),
  };

  return {
    id: 'off-' + barcode,
    source: 'barcode',
    product_name: p.product_name || null,
    nutrients_per_100g: nutrients,
    ingredients: p.ingredients_text || null,
    items: null,
    alerts: makeAlerts(nutrients),
    confidence: 'high',
    created_at: new Date().toISOString(),
  };
}

// Still fake. This becomes the vision-LLM call once the backend exists.
export async function scanLabelPhoto(photoUri: string): Promise<ScanResult> {
  await wait(1200);
  return {
    id: 'mock-photo',
    source: 'label_photo',
    product_name: 'Mock Instant Noodles',
    nutrients_per_100g: {
      energy_kcal: 430, fat_g: 17, saturated_fat_g: 8, carbs_g: 58,
      sugars_g: 3, fiber_g: 2, protein_g: 9, salt_g: 2.4,
    },
    ingredients: 'Wheat flour, palm oil, salt, flavour enhancer',
    items: null,
    alerts: [{ type: 'sodium', severity: 'danger', message: 'Very high salt' }],
    confidence: 'low',
    created_at: new Date().toISOString(),
  };
}