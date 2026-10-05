import json
import re
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
TERMS = json.loads((DATA / "sugar_terms.json").read_text(encoding="utf-8"))

DISCLAIMER = (
    "General information only, not medical advice. "
    "Always check the physical label and ask your doctor or dietitian."
)


def _tokens(text: str):
    text = text.lower()
    text = re.sub(r"^\s*ingredients\s*:?", "", text)
    text = re.sub(r"[()\[\]{}]", ",", text)
    text = re.sub(r"\d+(\.\d+)?\s*%", "", text)
    parts = re.split(r"[,;:]", text)
    return [p.strip() for p in parts if p.strip()]


def _find(token: str, terms):
    for t in terms:
        if re.search(rf"\b{re.escape(t)}\b", token):
            return t
    return None


def assess(ingredients_text, nutrients):
    """Returns a verdict dict. Verdicts: avoid, limit, likely_fine, cant_tell."""
    nutrients = nutrients or {}
    sugars = nutrients.get("sugars_g")
    tokens = _tokens(ingredients_text) if ingredients_text else []

    if not tokens and sugars is None:
        return {
            "verdict": "cant_tell",
            "reasons": ["No ingredient list or sugar data found. Photograph the ingredient panel."],
            "notes": [],
            "disclaimer": DISCLAIMER,
        }

    level = 0  # 0 = likely fine, 1 = limit, 2 = avoid
    reasons, notes = [], []

    for i, tok in enumerate(tokens):
        sugar = _find(tok, TERMS["added_sugars"])
        if sugar:
            if i < 2:
                level = max(level, 2)
                reasons.append(f"'{sugar}' is listed among the first ingredients, so it is a major component.")
            else:
                level = max(level, 1)
                reasons.append(f"Contains '{sugar}', an added sugar.")
        flour = _find(tok, TERMS["refined_flour"])
        if flour and i < 2:
            level = max(level, 1)
            reasons.append(f"Main ingredient is refined flour ('{flour}').")

    if sugars is not None:
        if sugars > 22.5:
            level = max(level, 2)
            reasons.append(f"High sugar content: {sugars} g per 100 g.")
        elif sugars > 5:
            level = max(level, 1)
            reasons.append(f"Moderate sugar content: {sugars} g per 100 g.")
    elif tokens:
        notes.append("Sugar amount not available for this product.")

    joined = " ".join(tokens)
    codes = "|".join(TERMS["sweetener_codes"])
    has_name = _find(joined, TERMS["sweetener_names"])
    has_code = re.search(rf"\b(?:ins|e)\s*-?\s*({codes})\b", joined)
    if has_name or has_code:
        notes.append("Contains a non-nutritive sweetener or sugar alcohol. Ask your dietitian how it fits your plan.")

    if level == 0:
        reasons.append("No added sugars or refined flour detected in the information available.")

    verdict = {2: "avoid", 1: "limit", 0: "likely_fine"}[level]
    return {"verdict": verdict, "reasons": reasons, "notes": notes, "disclaimer": DISCLAIMER}