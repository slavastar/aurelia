I am working on application to identify person biological age and several our parameters based on demographics and blood biomarkers of a person. Can you generate this information in the form of a CSV file for one person? 

Below you can find information about columns you should include in the CSV file.
The generated file should be created for one woman on every year of their life. For that, the value age in every next row has to be increased by 1, in comparison to previous row.

Given the fact that a sampled woman can die at any age, the number of rows in the CSV file can be variable. You should choose the dying age based on the real woman age distribution.
Keep in mind that the age cannot exceed 101 years old.

For information, the woman has the known characteristics througough her life:
skin color: {}
alcohol habit: {}
smoking habit: {}
children she totally had: {}
the country she lived: {}
her profession: {}
her family revenues: {}


The CSV columns have to be named by lowercase convention where words are separated by underscope _
Except the first row, the CSV file should contain only numeric values.
In this prompt, the names of columns are indicated between square braces []. 

# **Demographics:**

In this section, if a value is in parentheses right to an option, then it maps that option to that column.

[age] - Age (years old)
[weight] - Weight (kg)
[height] - Height (cm)

[menopause] - Have you reached menopause?
Yes (1) / No (-1) / Prefer not to answer (0)

[hormonal_contraception] - For women who are not menopausal: do you use hormonal contraception?
Yes (1) / No (-1) / Prefer not to answer (0)

[pregnancy] - Are you currently pregnant, planning a pregnancy, or have you been pregnant in the past?
Currently pregnant (1) / Planning a pregnancy (2) / Previously pregnant (3) / Not applicable (4) / Prefer not to answer (0)



# **Blood biomarkers:**

Starting from this section, remember that you have to provide biomarkers values based with respect to units of measurement specified between **. Also the normal ranges for women are provided for each biomarker but they are not the only possible values.

## Energy metabolism / Glycemic panel

[glucose] - Fasting glucose — **mmol/L** — **3.9 – 5.5** (≈ 70–99 mg/dL)
[insulin] - Fasting insulin — **µIU/mL** — **2 – 20** (typical fasting adults; many labs report 2–25)
[hba1c] - HbA1c — **%** — **< 5.7** (normal); **5.7–6.4** (prediabetes); **≥6.5** (diabetes)

---

## Oxygenation / Hematology

[hemoglobin] - Hemoglobin (Hb) — **g/dL** — **11.6 – 15.0**
[Hematocrit] - Hematocrit (Ht) — **%** — **36 – 44**
[mean_corpuscular_volume] - Mean Corpuscular Volume (MCV) — **fL** — **80 – 100**
[mean_corpuscular_hemoglobin] - Mean Corpuscular Hemoglobin (MCH) — **pg** — **27 – 33**
[mean_corpuscular_hemoglobin_concentration] - Mean Corpuscular Hemoglobin Concentration (MCHC) — **g/dL** — **32 – 36**
[red_blood_cell_count] - Red Blood Cell count (RBC) — **10^12/L** — **3.8 – 5.2**
[platelets] - Platelets — **10^9/L** — **150 – 400**

---

## Immunity & Inflammation

[wbc] - White Blood Cells (WBC / Leukocytes) — **10^9/L** — **4.0 – 11.0**
[hs_crp] - hs-CRP (high-sensitivity C-reactive protein) — **mg/L** — **< 0.5 optimal; 0.5–1 low; 1–3 moderate; >3 high** (risk categories)
[ferritin] - Ferritin — **µg/L (ng/mL)** — **15 – 150** (many labs: women >15; for symptomatic/functional iron use >30)
[transferrin] - Transferrin — **g/L** — **2.0 – 3.6** (lab-dependent)
[transferrin_saturation] - Transferrin saturation (TSAT) — **%** — **20 – 50** (approx.)
[esr] - ESR / Vitesse de sédimentation (ESR) — **mm/h** — **< 20** (typical adult female; increases with age)
[il6] - IL-6 — **pg/mL** — **< 5** (many healthy adults <2–5 pg/mL; lab-dependent)
[tNF] - TNF-α — **pg/mL** — **< 8** (low in healthy adults; assay-dependent)

---

## Kidney function

[creatinine] - Creatinine — **µmol/L** — **45 – 90** (female typical)
[eGFR] - eGFR (estimated GFR, CKD-EPI) — **mL/min/1.73 m²** — **≥ 90 (normal)**
[urea] - Urea / BUN — **mmol/L (urea)** — **2.5 – 7.5** (BUN 7–20 mg/dL)
[proteinuria] - Proteinuria (spot ACR) — **mg/g** — **< 30** (normal albumin/creatinine ratio)

---

## Liver function

[ast] - AST (ASAT / TGO) — **U/L** — **< 35–40** (lab-dependent)
[alt] - ALT (ALAT / TGP) — **U/L** — **< 35–40** (lab-dependent)
[ggt] - GGT — **U/L** — **< 40** (typical female; lab method dependent)
[alkaline_phosphatase] - Alkaline phosphatase (ALP / PAL) — **U/L** — **30 – 120** (age dependent)
[total_protein] - Total protein — **g/L** — **60 – 80** (6.0–8.0 g/dL)
[albumin] - Albumin — **g/L** — **35 – 50** (3.5–5.0 g/dL)
[globulins] - Globulins (total) — **g/L** — **20 – 35**

---

## Lipids & cardiovascular markers

[total_cholesterol] - Total cholesterol — **mmol/L** — **< 5.2** (≈ <200 mg/dL)
[hdl_cholesterol] - HDL-cholesterol (HDL-C) — **mmol/L** — **> 1.3** (≈ >50 mg/dL)
[ldl_cholesterol] - LDL-cholesterol (LDL-C) — **mmol/L** — **< 2.6** (≈ <100 mg/dL; target individualized)
[non_hdl_cholesterol] - Non-HDL cholesterol — **mmol/L** — **< 3.4** (≈ <130 mg/dL)
[triglycerides] - Triglycerides — **mmol/L** — **< 1.7** (≈ <150 mg/dL)
[apolipoprotein_a1] - Apolipoprotein A1 (ApoA1) — **g/L** — **1.0 – 1.8** (lab-dependent)
[apolipoprotein_b] - Apolipoprotein B (ApoB) — **g/L** — **0.6 – 1.2** (typical)
[homocysteine] - Homocysteine — **µmol/L** — **< 15** (optimal often <10)

---

## Thyroid

[tsh] - TSH — **mU/L** — **0.3 – 4.0** (lab-dependent; many labs tighten to 0.4–4.0)
[fT4] - Free T4 (fT4) — **pmol/L** — **12 – 22** (≈ 0.8–1.8 ng/dL)
[fT3] - Free T3 (fT3) — **pmol/L** — **3.1 – 6.8** (lab-dependent)

---

## Reproductive & sex hormones (women-focused)

[estradiol] - Estradiol (E2) — **pg/mL (pmol/L)** — **cycle-dependent** (very low in follicular, peaks at ovulation; typical follicular baseline ≈ 20–200 pg/mL)
[testosterone] - Testosterone (total) — **nmol/L** — **0.5 – 2.5** (typical female range; lab-dependent)
[lh] - LH — **IU/L (mIU/mL)** — **cycle-dependent** (follicular low ≈ 1–20; midcycle surge much higher)
[fsh] - FSH — **IU/L** — **cycle-dependent** (follicular ~3–10; rises post-menopause)
[prolactin] - Prolactin — **ng/mL** — **< 20** (lab-dependent)
[amh] - AMH (Anti-Müllerian Hormone) — **ng/mL (pmol/L)** — **age-dependent; typical reproductive-age medians: ~1–5 ng/mL**
[17_oh_progesterone] - 17-OH progesterone (17-OHP) — **ng/mL (nmol/L)** — **typical basal < 2 ng/mL; depends on time of cycle / pathology**

---

## Stress / Adrenal

[cortisol] - Cortisol (morning, plasma) — **nmol/L** — **~150 – 700** (approx.; varies by lab/time)
[dhea_s] - DHEA-S — **µg/dL (µmol/L)** — **age-dependent; wide range (e.g., 35–430 µg/dL for younger adults)**
[cortisol_dhea_ratio] - Cortisol : DHEA ratio — **unitless** — **laboratory/age-dependent** (interpret relatively)

---

## Vitamins & B-vitamins

[vitamin_d] - Vitamin D (25-OH D) — **ng/mL (nmol/L)** — **sufficiency > 30 ng/mL (75 nmol/L); insufficiency 20–30 ng/mL; deficiency < 20 ng/mL**
[folate] - Folate (serum) — **ng/mL** — **> 4.0 (typical lower limit ~3–4 ng/mL)**
[vitamin_b12] - Vitamin B12 — **pg/mL (pmol/L)** — **~200 – 900 pg/mL** (lab-dependent; functional deficiency possible >200 with symptoms)
[vitamin_b1] - Vitamin B1 (Thiamine, whole blood or transketolase) — **µg/L or nmol/L** — **assay-dependent; low if < reference lab value**
[vitamin_b6] - Vitamin B6 (PLP) — **µg/L** — **> 5 (lab-dependent)**
[vitamin_c] - Vitamin C (ascorbate) — **µmol/L** — **> 23 µmol/L typical; lab-dependent**

> Note: B1/B6/Plasma B6 and thiamine assays vary widely by lab — use lab reference.
> 

---

## Minerals & electrolytes

[calcium] - Calcium (total) — **mmol/L** — **2.2 – 2.6** (correct for albumin if needed)
[magnesium] - Magnesium — **mmol/L or mg/dL** — **lab-dependent; typical serum 0.7–1.1 mmol/L**
[potassium] - Potassium (K⁺) — **mmol/L** — **3.5 – 5.0**
[sodium] - Sodium (Na⁺) — **mmol/L** — **135 – 145**
[zinc] - Zinc — **µg/dL** — **lab-dependent (~70–120 µg/dL typical)**
[selenium] - Selenium — **µg/L** — **lab-dependent**
[iron] - Iron — **µg/dL (µmol/L)** — **serum iron typical 40–160 µg/dL; lab-dependent**
[ferritin] - Ferritin / Transferrin / TSAT — see above (Ferritin 15–150 µg/L; TSAT 20–50%)

---

## Muscle / Liver-muscle damage & recovery

[creatine_kinase] - Creatine Kinase (CK) — **U/L** — **female typical ~25 – 200** (lab-dependent; recent exercise raises it)
[ast_alt] - AST / ALT — **U/L** — (see Liver Function above)
[urea_bun] - Urea / BUN — **see Kidney**
[albumin_total_protein] - Albumin / Total protein — **see Liver**

---

## Miscellaneous / advanced markers

[apolipoprotein_a1] - ApoA1 — **g/L** — **1.0 – 1.8**
[apolipoprotein_b] - ApoB — **g/L** — **0.6 – 1.2**
[lipoprotein_particle_indices] - Lipoprotein particle indices (LP-IR etc.) — **unitless / scale-dependent** (vendor dependent)
[homocysteine] - Homocysteine — **µmol/L** — **< 15** (optimal < 10)
[amh] - AMH — **see Reproductive**
[esr_crp] - ESR / CRP — **see Inflammation**

# Targets
Finally, for every row, you have to also generate target columns:
[bioage] - bioage (0 - 100)

IMPORTANT INSTRUCTIONS:
1. You MUST generate a JSON file containing a list of dictionaries.
2. Each dictionary represents a timepoint in the person's life.
3. The first dictionary must have "age": 0.
4. Each subsequent dictionary must increment the age by a random step between 2 and 4 years (inclusive). The average step should be 3 years.
5. You must continue generating entries until the person reaches their dying age (e.g., 85).
6. **GENERATE AT LEAST 30 ENTRIES.**
7. Output ONLY the JSON content. No markdown code blocks.

Example structure:
[
  {{
    "age": 0,
    "weight": 3.5,
    "height": 50,
    ...
  }},
  {{
    "age": 3,
    "weight": 14.2,
    "height": 95,
    ...
  }},
  {{
    "age": 5,
    "weight": 18.1,
    "height": 110,
    ...
  }},
  ...
]