"""
Biomarker reference data with descriptions, units, and normal ranges.
Only biomarkers present in the user's profile will have their descriptions included.
"""

from typing import Dict, Optional

# Comprehensive biomarker reference database
BIOMARKER_REFERENCE: Dict[str, Dict[str, str]] = {
    # Energy metabolism / Glycemic panel
    "glucose": {
        "name": "Fasting glucose",
        "unit": "mmol/L",
        "range": "3.9 – 5.5",
        "alt_unit": "≈ 70–99 mg/dL"
    },
    "fasting_glucose": {
        "name": "Fasting glucose",
        "unit": "mmol/L",
        "range": "3.9 – 5.5",
        "alt_unit": "≈ 70–99 mg/dL"
    },
    "insulin": {
        "name": "Fasting insulin",
        "unit": "µIU/mL",
        "range": "2 – 20",
        "note": "typical fasting adults; many labs report 2–25"
    },
    "fasting_insulin": {
        "name": "Fasting insulin",
        "unit": "µIU/mL",
        "range": "2 – 20",
        "note": "typical fasting adults"
    },
    "hba1c": {
        "name": "HbA1c",
        "unit": "%",
        "range": "< 5.7 (normal); 5.7–6.4 (prediabetes); ≥6.5 (diabetes)"
    },
    
    # Oxygenation / Hematology
    "hemoglobin": {
        "name": "Hemoglobin (Hb)",
        "unit": "g/dL",
        "range": "11.6 – 15.0"
    },
    "hematocrit": {
        "name": "Hematocrit (Ht)",
        "unit": "%",
        "range": "36 – 44"
    },
    "mean_corpuscular_volume": {
        "name": "Mean Corpuscular Volume (MCV)",
        "unit": "fL",
        "range": "80 – 100"
    },
    "mcv": {
        "name": "Mean Corpuscular Volume (MCV)",
        "unit": "fL",
        "range": "80 – 100"
    },
    "mean_corpuscular_hemoglobin": {
        "name": "Mean Corpuscular Hemoglobin (MCH)",
        "unit": "pg",
        "range": "27 – 33"
    },
    "mch": {
        "name": "Mean Corpuscular Hemoglobin (MCH)",
        "unit": "pg",
        "range": "27 – 33"
    },
    "mean_corpuscular_hemoglobin_concentration": {
        "name": "Mean Corpuscular Hemoglobin Concentration (MCHC)",
        "unit": "g/dL",
        "range": "32 – 36"
    },
    "mchc": {
        "name": "Mean Corpuscular Hemoglobin Concentration (MCHC)",
        "unit": "g/dL",
        "range": "32 – 36"
    },
    "red_blood_cell_count": {
        "name": "Red Blood Cell count (RBC)",
        "unit": "10^12/L",
        "range": "3.8 – 5.2"
    },
    "rbc": {
        "name": "Red Blood Cell count (RBC)",
        "unit": "10^12/L",
        "range": "3.8 – 5.2"
    },
    "platelets": {
        "name": "Platelets",
        "unit": "10^9/L",
        "range": "150 – 400"
    },
    
    # Immunity & Inflammation
    "wbc": {
        "name": "White Blood Cells (WBC / Leukocytes)",
        "unit": "10^9/L",
        "range": "4.0 – 11.0"
    },
    "white_blood_cells": {
        "name": "White Blood Cells (WBC / Leukocytes)",
        "unit": "10^9/L",
        "range": "4.0 – 11.0"
    },
    "hs_crp": {
        "name": "hs-CRP (high-sensitivity C-reactive protein)",
        "unit": "mg/L",
        "range": "< 0.5 optimal; 0.5–1 low; 1–3 moderate; >3 high"
    },
    "hscrp": {
        "name": "hs-CRP (high-sensitivity C-reactive protein)",
        "unit": "mg/L",
        "range": "< 0.5 optimal; 0.5–1 low; 1–3 moderate; >3 high"
    },
    "crp": {
        "name": "C-reactive protein",
        "unit": "mg/L",
        "range": "< 0.5 optimal; 0.5–1 low; 1–3 moderate; >3 high"
    },
    "ferritin": {
        "name": "Ferritin",
        "unit": "µg/L (ng/mL)",
        "range": "15 – 150",
        "note": "for symptomatic/functional iron use >30"
    },
    "transferrin": {
        "name": "Transferrin",
        "unit": "g/L",
        "range": "2.0 – 3.6"
    },
    "transferrin_saturation": {
        "name": "Transferrin saturation (TSAT)",
        "unit": "%",
        "range": "20 – 50"
    },
    "tsat": {
        "name": "Transferrin saturation (TSAT)",
        "unit": "%",
        "range": "20 – 50"
    },
    "esr": {
        "name": "ESR (Erythrocyte Sedimentation Rate)",
        "unit": "mm/h",
        "range": "< 20",
        "note": "typical adult female; increases with age"
    },
    "il6": {
        "name": "IL-6",
        "unit": "pg/mL",
        "range": "< 5",
        "note": "many healthy adults <2–5 pg/mL"
    },
    "tnf": {
        "name": "TNF-α",
        "unit": "pg/mL",
        "range": "< 8",
        "note": "low in healthy adults; assay-dependent"
    },
    
    # Kidney function
    "creatinine": {
        "name": "Creatinine",
        "unit": "µmol/L",
        "range": "45 – 90",
        "note": "female typical"
    },
    "egfr": {
        "name": "eGFR (estimated GFR, CKD-EPI)",
        "unit": "mL/min/1.73 m²",
        "range": "≥ 90 (normal)"
    },
    "urea": {
        "name": "Urea / BUN",
        "unit": "mmol/L",
        "range": "2.5 – 7.5",
        "alt_unit": "BUN 7–20 mg/dL"
    },
    "bun": {
        "name": "BUN (Blood Urea Nitrogen)",
        "unit": "mg/dL",
        "range": "7 – 20",
        "alt_unit": "2.5–7.5 mmol/L"
    },
    "proteinuria": {
        "name": "Proteinuria (spot ACR)",
        "unit": "mg/g",
        "range": "< 30",
        "note": "normal albumin/creatinine ratio"
    },
    
    # Liver function
    "ast": {
        "name": "AST (ASAT / TGO)",
        "unit": "U/L",
        "range": "< 35–40"
    },
    "alt": {
        "name": "ALT (ALAT / TGP)",
        "unit": "U/L",
        "range": "< 35–40"
    },
    "ggt": {
        "name": "GGT",
        "unit": "U/L",
        "range": "< 40",
        "note": "typical female"
    },
    "alkaline_phosphatase": {
        "name": "Alkaline phosphatase (ALP / PAL)",
        "unit": "U/L",
        "range": "30 – 120",
        "note": "age dependent"
    },
    "alp": {
        "name": "Alkaline phosphatase (ALP)",
        "unit": "U/L",
        "range": "30 – 120",
        "note": "age dependent"
    },
    "total_protein": {
        "name": "Total protein",
        "unit": "g/L",
        "range": "60 – 80",
        "alt_unit": "6.0–8.0 g/dL"
    },
    "albumin": {
        "name": "Albumin",
        "unit": "g/L",
        "range": "35 – 50",
        "alt_unit": "3.5–5.0 g/dL"
    },
    "globulins": {
        "name": "Globulins (total)",
        "unit": "g/L",
        "range": "20 – 35"
    },
    
    # Lipids & cardiovascular markers
    "total_cholesterol": {
        "name": "Total cholesterol",
        "unit": "mmol/L",
        "range": "< 5.2",
        "alt_unit": "≈ <200 mg/dL"
    },
    "hdl_cholesterol": {
        "name": "HDL-cholesterol (HDL-C)",
        "unit": "mmol/L",
        "range": "> 1.3",
        "alt_unit": "≈ >50 mg/dL"
    },
    "hdl": {
        "name": "HDL-cholesterol",
        "unit": "mmol/L",
        "range": "> 1.3",
        "alt_unit": "≈ >50 mg/dL"
    },
    "ldl_cholesterol": {
        "name": "LDL-cholesterol (LDL-C)",
        "unit": "mmol/L",
        "range": "< 2.6",
        "alt_unit": "≈ <100 mg/dL; target individualized"
    },
    "ldl": {
        "name": "LDL-cholesterol",
        "unit": "mmol/L",
        "range": "< 2.6",
        "alt_unit": "≈ <100 mg/dL"
    },
    "non_hdl_cholesterol": {
        "name": "Non-HDL cholesterol",
        "unit": "mmol/L",
        "range": "< 3.4",
        "alt_unit": "≈ <130 mg/dL"
    },
    "triglycerides": {
        "name": "Triglycerides",
        "unit": "mmol/L",
        "range": "< 1.7",
        "alt_unit": "≈ <150 mg/dL"
    },
    "apolipoprotein_a1": {
        "name": "Apolipoprotein A1 (ApoA1)",
        "unit": "g/L",
        "range": "1.0 – 1.8"
    },
    "apoa1": {
        "name": "Apolipoprotein A1 (ApoA1)",
        "unit": "g/L",
        "range": "1.0 – 1.8"
    },
    "apolipoprotein_b": {
        "name": "Apolipoprotein B (ApoB)",
        "unit": "g/L",
        "range": "0.6 – 1.2"
    },
    "apob": {
        "name": "Apolipoprotein B (ApoB)",
        "unit": "g/L",
        "range": "0.6 – 1.2"
    },
    "homocysteine": {
        "name": "Homocysteine",
        "unit": "µmol/L",
        "range": "< 15",
        "note": "optimal often <10"
    },
    
    # Thyroid
    "tsh": {
        "name": "TSH",
        "unit": "mU/L",
        "range": "0.3 – 4.0",
        "note": "many labs tighten to 0.4–4.0"
    },
    "ft4": {
        "name": "Free T4 (fT4)",
        "unit": "pmol/L",
        "range": "12 – 22",
        "alt_unit": "≈ 0.8–1.8 ng/dL"
    },
    "free_t4": {
        "name": "Free T4 (fT4)",
        "unit": "pmol/L",
        "range": "12 – 22",
        "alt_unit": "≈ 0.8–1.8 ng/dL"
    },
    "ft3": {
        "name": "Free T3 (fT3)",
        "unit": "pmol/L",
        "range": "3.1 – 6.8"
    },
    "free_t3": {
        "name": "Free T3 (fT3)",
        "unit": "pmol/L",
        "range": "3.1 – 6.8"
    },
    
    # Reproductive & sex hormones
    "estradiol": {
        "name": "Estradiol (E2)",
        "unit": "pg/mL (pmol/L)",
        "range": "cycle-dependent",
        "note": "follicular baseline ≈ 20–200 pg/mL"
    },
    "testosterone": {
        "name": "Testosterone (total)",
        "unit": "nmol/L",
        "range": "0.5 – 2.5",
        "note": "typical female range"
    },
    "lh": {
        "name": "LH",
        "unit": "IU/L (mIU/mL)",
        "range": "cycle-dependent",
        "note": "follicular low ≈ 1–20; midcycle surge higher"
    },
    "fsh": {
        "name": "FSH",
        "unit": "IU/L",
        "range": "cycle-dependent",
        "note": "follicular ~3–10; rises post-menopause"
    },
    "prolactin": {
        "name": "Prolactin",
        "unit": "ng/mL",
        "range": "< 20"
    },
    "amh": {
        "name": "AMH (Anti-Müllerian Hormone)",
        "unit": "ng/mL (pmol/L)",
        "range": "age-dependent",
        "note": "typical reproductive-age medians: ~1–5 ng/mL"
    },
    "17_oh_progesterone": {
        "name": "17-OH progesterone (17-OHP)",
        "unit": "ng/mL (nmol/L)",
        "range": "typical basal < 2 ng/mL",
        "note": "depends on time of cycle"
    },
    
    # Stress / Adrenal
    "cortisol": {
        "name": "Cortisol (morning, plasma)",
        "unit": "nmol/L",
        "range": "~150 – 700",
        "note": "varies by lab/time"
    },
    "cortisol_am": {
        "name": "Cortisol (morning)",
        "unit": "nmol/L",
        "range": "~150 – 700",
        "note": "morning plasma"
    },
    "dhea_s": {
        "name": "DHEA-S",
        "unit": "µg/dL (µmol/L)",
        "range": "age-dependent",
        "note": "e.g., 35–430 µg/dL for younger adults"
    },
    "cortisol_dhea_ratio": {
        "name": "Cortisol : DHEA ratio",
        "unit": "unitless",
        "range": "laboratory/age-dependent"
    },
    
    # Vitamins & B-vitamins
    "vitamin_d": {
        "name": "Vitamin D (25-OH D)",
        "unit": "ng/mL (nmol/L)",
        "range": "> 30 ng/mL (75 nmol/L) sufficiency; 20–30 insufficiency; < 20 deficiency"
    },
    "folate": {
        "name": "Folate (serum)",
        "unit": "ng/mL",
        "range": "> 4.0",
        "note": "typical lower limit ~3–4 ng/mL"
    },
    "vitamin_b12": {
        "name": "Vitamin B12",
        "unit": "pg/mL (pmol/L)",
        "range": "~200 – 900 pg/mL",
        "note": "functional deficiency possible >200 with symptoms"
    },
    "b12": {
        "name": "Vitamin B12",
        "unit": "pg/mL",
        "range": "~200 – 900 pg/mL"
    },
    "vitamin_b1": {
        "name": "Vitamin B1 (Thiamine)",
        "unit": "µg/L or nmol/L",
        "range": "assay-dependent"
    },
    "vitamin_b6": {
        "name": "Vitamin B6 (PLP)",
        "unit": "µg/L",
        "range": "> 5"
    },
    "vitamin_c": {
        "name": "Vitamin C (ascorbate)",
        "unit": "µmol/L",
        "range": "> 23 µmol/L"
    },
    
    # Minerals & electrolytes
    "calcium": {
        "name": "Calcium (total)",
        "unit": "mmol/L",
        "range": "2.2 – 2.6",
        "note": "correct for albumin if needed"
    },
    "magnesium": {
        "name": "Magnesium",
        "unit": "mmol/L or mg/dL",
        "range": "typical serum 0.7–1.1 mmol/L"
    },
    "potassium": {
        "name": "Potassium (K⁺)",
        "unit": "mmol/L",
        "range": "3.5 – 5.0"
    },
    "sodium": {
        "name": "Sodium (Na⁺)",
        "unit": "mmol/L",
        "range": "135 – 145"
    },
    "zinc": {
        "name": "Zinc",
        "unit": "µg/dL",
        "range": "~70–120 µg/dL typical"
    },
    "selenium": {
        "name": "Selenium",
        "unit": "µg/L",
        "range": "lab-dependent"
    },
    "iron": {
        "name": "Iron (serum)",
        "unit": "µg/dL (µmol/L)",
        "range": "40–160 µg/dL typical"
    },
    "serum_iron": {
        "name": "Iron (serum)",
        "unit": "µg/dL",
        "range": "40–160 µg/dL"
    },
    
    # Muscle / Liver-muscle damage & recovery
    "creatine_kinase": {
        "name": "Creatine Kinase (CK)",
        "unit": "U/L",
        "range": "~25 – 200",
        "note": "female typical; recent exercise raises it"
    },
    "ck": {
        "name": "Creatine Kinase (CK)",
        "unit": "U/L",
        "range": "~25 – 200",
        "note": "recent exercise raises it"
    },
}


def get_biomarker_info(biomarker_key: str) -> Optional[Dict[str, str]]:
    """
    Get reference information for a biomarker.
    
    Args:
        biomarker_key: The biomarker key (normalized to lowercase with underscores)
    
    Returns:
        Dictionary with biomarker info or None if not found
    """
    # Normalize key
    normalized_key = biomarker_key.lower().replace(" ", "_").replace("-", "_")
    return BIOMARKER_REFERENCE.get(normalized_key)


def format_biomarker_description(biomarker_key: str, value: str) -> str:
    """
    Format a biomarker description including name, value, unit, and range.
    
    Args:
        biomarker_key: The biomarker key
        value: The biomarker value
    
    Returns:
        Formatted description string
    """
    info = get_biomarker_info(biomarker_key)
    if not info:
        return f"{biomarker_key}: {value}"
    
    parts = [f"{info['name']}: {value}"]
    
    # Add unit and range
    if "unit" in info and "range" in info:
        parts.append(f"(Unit: {info['unit']}, Normal range: {info['range']})")
    
    # Add alternative unit if available
    if "alt_unit" in info:
        parts.append(f"[{info['alt_unit']}]")
    
    # Add note if available
    if "note" in info:
        parts.append(f"— {info['note']}")
    
    return " ".join(parts)


def get_biomarkers_with_descriptions(biomarkers: dict) -> dict:
    """
    Enrich biomarkers dictionary with reference information.
    Only includes descriptions for biomarkers that are present.
    
    Args:
        biomarkers: Dictionary of biomarker values
    
    Returns:
        Dictionary with biomarker values and their descriptions
    """
    enriched = {}
    
    for key, value in biomarkers.items():
        info = get_biomarker_info(key)
        if info:
            enriched[key] = {
                "value": value,
                "name": info["name"],
                "unit": info["unit"],
                "range": info["range"],
                "alt_unit": info.get("alt_unit"),
                "note": info.get("note")
            }
        else:
            # Keep original value if no reference info
            enriched[key] = {"value": value}
    
    return enriched
