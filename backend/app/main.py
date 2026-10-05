import requests
from fastapi import FastAPI

from .matcher import assess

app = FastAPI(title="Diabetes Food Scanner API")

OFF_URL = "https://world.openfoodfacts.org/api/v2/product/{}.json"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/scan/barcode/{barcode}")
def scan_barcode(barcode: str):
    r = requests.get(
        OFF_URL.format(barcode),
        params={"fields": "product_name,ingredients_text,nutriments"},
        headers={"User-Agent": "DiabetesScannerCapstone/0.1 (student project)"},
        timeout=10,
    )
    data = r.json()

    if data.get("status") != 1 or not data.get("product"):
        result = assess(None, None)
        return {"found": False, "barcode": barcode, "product_name": None, **result}

    p = data["product"]
    m = p.get("nutriments") or {}

    def num(key):
        v = m.get(key)
        return v if isinstance(v, (int, float)) else None

    nutrients = {
        "energy_kcal": num("energy-kcal_100g"),
        "sugars_g": num("sugars_100g"),
        "carbs_g": num("carbohydrates_100g"),
        "fiber_g": num("fiber_100g"),
        "protein_g": num("proteins_100g"),
        "fat_g": num("fat_100g"),
        "salt_g": num("salt_100g"),
    }
    ingredients = p.get("ingredients_text") or None
    result = assess(ingredients, nutrients)

    return {
        "found": True,
        "barcode": barcode,
        "product_name": p.get("product_name") or None,
        "ingredients": ingredients,
        "nutrients_per_100g": nutrients,
        **result,
    }