# Project Structure

```
aurelia/
├── src/
│   └── aurelia/               # Main package
│       ├── __init__.py       # Package exports
│       ├── api.py            # FastAPI REST API server
│       ├── health_coach.py   # AI health coach orchestration
│       ├── schemas.py        # Pydantic models & data structures
│       ├── tools.py          # Search tools (web & Reddit)
│       ├── json_adapter.py   # Model output transformer
│       └── scoring/          # Scoring modules
│           ├── __init__.py
│           ├── metabolic_scores.py      # Metabolic efficiency scoring
│           ├── inflammation_scores.py   # Inflammation/recovery scoring
│           └── oxygen_scores.py         # Oxygen transport scoring
│
├── tests/                    # Test suite
│   ├── __init__.py
│   ├── test_integration.py   # Comprehensive integration test
│   ├── test_metabolic_score.py
│   ├── test_inflammation_score.py
│   ├── test_oxygen_score.py
│   └── ...
│
├── data/                     # Data files
│   └── ...
│
├── run_api.py               # API server entry point
├── main.py                  # CLI entry point
├── pyproject.toml           # Project configuration
├── .env                     # Environment variables (API keys)
└── README.md                # Documentation
```

## Module Organization

### Core Package (`src/aurelia/`)
- **api.py**: FastAPI REST endpoints with automatic OpenAPI documentation
- **health_coach.py**: AI orchestration with iterative research and tool integration
- **schemas.py**: Pydantic models for type-safe data validation
- **tools.py**: Web search (DuckDuckGo) and Reddit research capabilities
- **json_adapter.py**: Transforms AI model output to required schema format

### Scoring System (`src/aurelia/scoring/`)
All scoring modules follow the same pattern:
1. Extract relevant biomarkers from user input
2. Convert units to standardized format
3. Calculate z-scores against population norms
4. Apply weighted penalties
5. Return score (0-100) with interpretation

- **metabolic_scores.py**: Evaluates insulin resistance and metabolic efficiency
  - HOMA-IR, TG/HDL ratio, ApoB/ApoA1 ratio, HbA1c
  - Higher score = better metabolic health
  
- **inflammation_scores.py**: Quantifies systemic inflammation vs recovery
  - hsCRP, ESR, ferritin, WBC
  - Separate norms for menstruating/non-menstruating women
  - Higher score = less inflammation, better recovery
  
- **oxygen_scores.py**: Measures oxygen transport capacity
  - Hemoglobin, hematocrit, RBC count, serum iron
  - Only penalizes LOW values (targets anemia)
  - Higher score = better oxygen delivery

## Running Tests

### Integration Test
Tests all scoring systems with comprehensive biomarker profile:
```bash
uv run python tests/test_integration.py
```

### Individual Score Tests
```bash
uv run python tests/test_metabolic_score.py
uv run python tests/test_inflammation_score.py
uv run python tests/test_oxygen_score.py
```

## Running the API

```bash
python run_api.py
```

Then visit `http://localhost:8000/docs` for interactive API documentation.

## Key Features

✅ **Multi-dimensional Health Assessment**
- Biological age vs chronological age
- Metabolic efficiency scoring
- Inflammation/recovery status
- Oxygen transport capacity
- Optional facial skin age estimation

✅ **Evidence-Based Recommendations**
- AI researches optimal interventions
- Web search + Reddit community insights
- Referenced sources for all recommendations
- Personalized supplement protocols

✅ **Robust Architecture**
- Type-safe with Pydantic v2
- Modular scoring systems
- Graceful handling of partial data
- Unit conversion for international standards
- JSON schema validation
