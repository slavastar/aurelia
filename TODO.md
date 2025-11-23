# AURELIA - Project TODO & Integration Notes

## 🚀 Project Overview
AUREL✦A is a longevity strategist and women's health intelligence agent that analyzes blood biomarkers and health data to provide personalized health insights.

## 📋 Current Status: Phase 2 - PDF Upload & Document AI Integration COMPLETE ✅

---

## 🔴 CRITICAL: ML Model Integration (PENDING)

### Status: WAITING FOR ML TEAM
The ML model endpoint is currently **NOT READY**. Team members are working on it.

### What We Need from ML Team:
1. **API Endpoint URL**
   - Example: `https://ml-api.aurelia.com/predict`
   - Should accept POST requests

2. **Input Format** (what we'll send):
   ```json
   {
     "biomarkers": {
       "HbA1c": 5.4,
       "Ferritin": 45,
       "CRP": 1.2,
       "TSH": 2.1,
       "VitaminD": 32,
       // ... other extracted biomarkers
     },
     "context": {
       "age": 34,
       "cycle_status": "follicular",
       "symptoms": ["fatigue", "brain_fog"],
       "lifestyle": {
         "sleep_hours": 6.5,
         "exercise_frequency": "moderate",
         "stress_level": "high"
       }
     }
   }
   ```

3. **Output Format** (what we expect back):
   ```json
   {
     "risk_score": 67.5,  // 0-100 scale (higher = better health)
     "confidence": 0.85,
     "risk_factors": ["low_ferritin", "elevated_crp"],
     "model_version": "v1.0.0"
   }
   ```

4. **Authentication**:
   - API Key? Bearer Token? None?
   - Rate limits?

5. **Error Handling**:
   - What error codes to expect?
   - Retry logic needed?

### Current Implementation:
- ✅ Mock ML model endpoint created at `/api/ml-model/route.ts`
- ✅ Returns realistic mock data for development
- ⏳ Ready to swap with real endpoint when available

### Integration Checklist:
- [ ] Get API endpoint URL from ML team
- [ ] Get API authentication credentials
- [ ] Confirm input/output format matches
- [ ] Test with sample data
- [ ] Update `src/lib/ml-model/client.ts`
- [ ] Add environment variables:
  - `ML_MODEL_API_URL`
  - `ML_MODEL_API_KEY` (if needed)
- [ ] Remove mock endpoint
- [ ] Update documentation

---

## 📊 Implementation Phases

### ✅ Phase 1: Project Initialization (COMPLETE)
- [x] Create TODO.md
- [x] Initialize Next.js 14+ with TypeScript
- [x] Install core dependencies
- [x] Configure Tailwind CSS
- [x] Set up Shadcn/ui
- [x] Create folder structure
- [x] Configure environment variables
- [x] Update README.md
- [x] All 19 tests passing

### ✅ Phase 2: PDF Upload & Document AI Integration (COMPLETE)
- [x] PDF upload component (drag-drop with react-dropzone)
- [x] File validation (size, type, format)
- [x] Vercel Blob storage integration
- [x] Upload API endpoint
- [x] Pixtral OCR client setup
- [x] PDF → OCR text extraction
- [x] Intelligent biomarker parser (30+ patterns)
- [x] Adaptive extraction (works with any format)
- [x] Smart validation (3-tier: pass/warn/block)
- [x] Review & correction page
- [x] Manual biomarker editing
- [x] Add missing biomarkers interface
- [x] Real-time validation feedback
- [x] Updated homepage with upload flow
- [x] Error handling for failed extractions
- [x] Confidence scoring
- [x] Missing biomarker suggestions

### 📦 Phase 3: Core Data Models (PARTIALLY COMPLETE)
- [x] Define biomarker types (flexible schema)
- [x] Create mandatory vs optional field definitions
- [x] Type definitions for all data flows
- [x] Emergency value thresholds
- [ ] Build validation schemas with Zod (can be enhanced)

### 📝 Phase 4: Supplementary Questionnaire (NEXT)
- [ ] Symptom selector component
- [ ] Menstrual cycle tracker
- [ ] Lifestyle questions (sleep, stress, exercise)
- [ ] Health goals selector
- [ ] Form state management
- [ ] Progress tracking

### 🔮 Phase 5: ML Model Integration (Mock)
- [x] Create mock ML model endpoint
- [ ] Mock risk score generation (0-100)
- [ ] Document expected input/output format
- [ ] Add integration tests
- [ ] Prepare for real endpoint swap

### 🧠 Phase 6: AUREL✦A Agent Core
- [ ] Implement system prompt for Gemini
- [ ] Safety guardrails (emergency detection)
- [ ] Female health analysis logic
- [ ] Biomarker interpretation
- [ ] Triangulation logic (symptoms + biomarkers)
- [ ] Report formatter (markdown)
- [ ] Cycle-aware analysis

### ✨ Phase 7: Gemini Integration
- [ ] Google Gemini 2.5-flash client
- [ ] Prompt builder (inject user data)
- [ ] API endpoint for analysis
- [ ] Error handling and retries
- [ ] Response parsing
- [ ] Rate limiting

### 📈 Phase 8: Results Dashboard
- [ ] Health score visualization
- [ ] Biomarker charts and graphs
- [ ] Display formatted AUREL✦A report
- [ ] Export to PDF functionality
- [ ] Share/save options
- [ ] Mobile responsive design

### 🧪 Phase 9: Testing & Optimization
- [ ] Unit tests for core logic
- [ ] Integration tests for API flow
- [ ] Test with sample PDFs
- [ ] Performance optimization
- [ ] Error handling
- [ ] Accessibility audit

### 🚀 Phase 10: Deployment
- [ ] Vercel configuration
- [ ] Environment variables setup
- [ ] Google Cloud credentials
- [ ] Domain configuration
- [ ] Monitoring setup
- [ ] Analytics integration

---

## 🔐 Environment Variables

### Required (Production):
```env
# Google Gemini API
GOOGLE_GEMINI_API_KEY=AIzaSyC6reISf3ctxkS0OxXlm7ULK-jIdF5b1VA

# Google Cloud Document AI
GOOGLE_CLOUD_PROJECT_ID=eazytrack-dafcf
GOOGLE_CLOUD_CREDENTIALS=<service_account_json>
DOCUMENT_AI_PROCESSOR_ID=<to_be_created>

# ML Model (when ready)
ML_MODEL_API_URL=<pending_from_ml_team>
ML_MODEL_API_KEY=<pending_from_ml_team>

# Optional
DATABASE_URL=<optional_for_data_persistence>
BLOB_READ_WRITE_TOKEN=<optional_for_file_storage>
```

---

## 🎯 Mandatory Baseline Biomarkers

These are the **minimum required** biomarkers for accurate analysis:

1. **HbA1c** - Glucose control (diabetes risk)
2. **Ferritin** - Iron stores (energy, fatigue)
3. **CRP** - Inflammation marker
4. **TSH** - Thyroid function (metabolism, mood)

### Optional but Valuable:
- Vitamin D
- Vitamin B12
- Complete Blood Count (CBC)
- Lipid Panel (Total Cholesterol, LDL, HDL, Triglycerides)
- Liver Function (ALT, AST)
- Kidney Function (Creatinine, eGFR)
- Hormones (Estrogen, Progesterone, Testosterone)

---

## 🚨 Safety Guardrails

### Emergency Value Thresholds (Immediate Referral):
- **Glucose**: <50 or >400 mg/dL
- **Troponin**: Any elevation (cardiac marker)
- **Creatinine**: >3.0 mg/dL (kidney failure)
- **Potassium**: <2.5 or >6.0 mEq/L
- **Hemoglobin**: <7 g/dL (severe anemia)

### Out of Scope (Refer to Specialist):
- Cancer diagnoses or tumor markers
- Pregnancy complications
- Medication dosage recommendations
- Acute symptoms (chest pain, suicidal ideation)

---

## 📚 Technical Stack

### Frontend:
- Next.js 14+ (App Router)
- TypeScript
- React 18
- Tailwind CSS
- Shadcn/ui
- React Hook Form
- Zod validation
- Recharts (data visualization)

### Backend:
- Next.js API Routes (serverless)
- Google Gemini 2.5-flash
- Google Cloud Document AI
- Mock ML Model (temporary)

### Deployment:
- Vercel (primary)
- Google Cloud (Document AI)

---

## 🐛 Known Issues & Limitations

1. **Document AI Accuracy**: May not extract all biomarkers correctly from all lab formats
   - Solution: Manual correction interface
   
2. **ML Model Pending**: Using mock data until team delivers endpoint
   - Impact: Risk scores are simulated
   
3. **PDF Format Variations**: Different labs use different formats
   - Solution: Support multiple parsers, fallback to OCR

---

## 📞 Team Contacts

- **ML Model Team**: [Contact info needed]
- **Document AI Setup**: [Contact info needed]
- **Project Lead**: [Contact info needed]

---

## 📝 Notes

- All health data must be handled with HIPAA-like privacy standards
- No data should be stored without explicit user consent
- All analysis must include non-diagnostic disclaimers
- Focus on female physiology (cycle-aware, iron-focused, thyroid-prioritized)

---

**Last Updated**: [Auto-generated on creation]
**Next Review**: After Phase 1 completion
