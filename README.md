# AURELIA - AI Health Recommendation Coach

[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An intelligent AI health coach that analyzes your biomarkers, lifestyle data, and biological age to generate personalized, evidence-based health optimization plans with cited research sources.

## 🌟 Features

- **🔍 Comprehensive Research**: Automatically searches medical literature and health databases
- **📊 Biomarker Analysis**: Interprets lab results and identifies health risks
- **🎯 Personalized Recommendations**: Tailored diet, exercise, and supplement protocols
- **📚 Source Citations**: Every recommendation backed by credible URLs
- **🔄 Biological Age Tracking**: Analyzes age acceleration and reversal strategies
- **💾 Structured Output**: JSON reports with health assessment, interventions, and monitoring plans

## 🚀 Quick Start

### CLI Usage

```bash
# Clone repository
git clone <your-repo-url>
cd aurelia

# Install dependencies with uv
uv sync

# Set up API key
echo "NET_MIND_API_KEY=your_key_here" > .env

# Generate health report
uv run python main.py
```

### API Server

```bash
# Start FastAPI server
python api.py

# Access at http://localhost:8000
# Interactive docs: http://localhost:8000/docs
```

See [API.md](API.md) for complete API documentation.

## 📋 What It Does

AURELIA analyzes your health data and:
1. **Identifies metabolic dysfunctions** (prediabetes, dyslipidemia, deficiencies)
2. **Searches latest research** on interventions for your specific conditions
3. **Generates prioritized action plan** with diet, exercise, and supplements
4. **Provides monitoring protocol** with expected biomarker improvements
5. **Saves detailed report** with all sources and timeline

## 📊 Example Output

```json
{
  "health_assessment": {
    "bioage_gap": 3.5,
    "primary_risks": ["Type 2 diabetes", "Cardiovascular disease"]
  },
  "recommendations": [
    {
      "priority": 1,
      "title": "Implement Mediterranean Diet",
      "action": "Detailed protocol...",
      "sources": [{"title": "Study name", "url": "pubmed.gov/..."}]
    }
  ],
  "supplement_protocol": [...],
  "monitoring_plan": {...}
}
```

## 🛠️ Technology Stack

- **AI Model**: moonshotai/Kimi-K2-Instruct via NetMind AI
- **Search**: DuckDuckGo (medical research, health databases)
- **Community**: Reddit API (success stories, protocols)
- **Framework**: OpenAI function calling with iterative tool use
- **Type Safety**: Pydantic models for data validation
- **Architecture**: Clean, modular design with separated concerns

## 📖 Documentation

See [USAGE.md](USAGE.md) for detailed documentation on:
- Configuration options
- Custom health profiles
- API usage examples
- Output format specification

## 🎯 Use Cases

- **Health Optimization**: Reverse biological age acceleration
- **Prediabetes Management**: Evidence-based glucose control
- **Cardiovascular Health**: Lipid optimization protocols
- **Longevity Planning**: Anti-aging interventions
- **Research Synthesis**: Automated health literature review

## ⚠️ Disclaimer

This tool is for educational and research purposes. Always consult healthcare professionals before making medical decisions or starting new health protocols.

## 📄 License

MIT License - see LICENSE file for details

---

**Hackathon Project**: Aurelia Longevity AI
**Built with**: NetMind AI, OpenAI, DuckDuckGo Search