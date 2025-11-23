"""
JSON adapter to transform model's creative output into required schema.
"""
from typing import Dict, Any, List
from .schemas import (
    HealthReport, HealthAssessment, BiomarkerFinding,
    Recommendation, LifestyleInterventions, LifestyleIntervention,
    MonitoringPlan, BiomarkerExpectation, Source
)


def adapt_model_json_to_schema(model_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform model's creative JSON structure into required HealthReport schema.
    
    The model tends to create custom structures like:
    - biological_age_analysis
    - priority_interventions  
    - nutrition_protocol
    
    This function maps these to our required structure:
    - health_assessment
    - recommendations (includes supplements)
    - lifestyle_interventions
    - monitoring_plan
    """
    # Initialize result with required keys
    result = {}
    
    # 1. Build health_assessment
    result["health_assessment"] = _extract_health_assessment(model_json)
    
    # 2. Build recommendations (includes supplements)
    result["recommendations"] = _extract_recommendations(model_json)
    
    # 3. Build lifestyle_interventions
    result["lifestyle_interventions"] = _extract_lifestyle(model_json)
    
    # 4. Build monitoring_plan
    result["monitoring_plan"] = _extract_monitoring(model_json)
    
    return result


def _extract_health_assessment(data: Dict) -> Dict:
    """Extract or build health_assessment from model's output."""
    # If it already exists, return it
    if "health_assessment" in data:
        return data["health_assessment"]
    
    # Build from biological_age_analysis or similar
    bioage_info = data.get("biological_age_analysis", {})
    
    result = {
        "key_findings": _extract_key_findings(data),
        "overall_health_status": bioage_info.get("reversal_potential", "Assessment needed"),
        "primary_risks": bioage_info.get("primary_drivers", [])
    }
    
    # Add bioage fields only if present (backwards compatibility)
    bioage_gap = _extract_bioage_gap(data)
    if bioage_gap != 0.0:
        result["bioage_gap"] = bioage_gap
        result["bioage_gap_description"] = bioage_info.get("current_status", "Biological age analysis needed")
    
    return result


def _extract_bioage_gap(data: Dict) -> float:
    """Extract bioage gap from various possible locations."""
    # Check biological_age_analysis
    bio_analysis = data.get("biological_age_analysis", {})
    if "bioage_gap" in bio_analysis:
        return float(bio_analysis["bioage_gap"])
    
    # Default to 0.0 if not found
    return 0.0


def _extract_key_findings(data: Dict) -> List[Dict]:
    """Extract biomarker findings from model output."""
    findings = []
    
    # Check biomarker_specific_recommendations
    if "biomarker_specific_recommendations" in data:
        for rec in data["biomarker_specific_recommendations"]:
            findings.append({
                "biomarker": rec.get("biomarker", ""),
                "value": rec.get("current_value", ""),
                "status": "elevated",  # Default
                "concern_level": "medium"  # Default
            })
    
    # Ensure at least one finding
    if not findings:
        findings.append({
            "biomarker": "Overall Health",
            "value": "Needs Assessment",
            "status": "normal",
            "concern_level": "low"
        })
    
    return findings


def _extract_recommendations(data: Dict) -> List[Dict]:
    """Extract recommendations from various possible locations, including supplements."""
    recs = []
    
    # Check priority_interventions or recommendations
    priority_list = data.get("priority_interventions", data.get("recommendations", []))
    if priority_list:
        for i, item in enumerate(priority_list, 1):
            rec = {
                "priority": item.get("priority", i),
                "category": _map_category(item.get("category", "supplementation")),
                "title": item.get("intervention", item.get("title", "Intervention")),
                "action": item.get("protocol", item.get("action", "")),
                "rationale": item.get("reasoning", item.get("rationale", item.get("evidence", ""))),
                "expected_timeline": item.get("expected_timeline", "8-12 weeks"),
                "sources": _extract_sources(item)
            }
            recs.append(rec)
    
    # Also extract from supplement_protocol if present (merge into recommendations)
    if "supplement_protocol" in data:
        supplements = data["supplement_protocol"]
        if isinstance(supplements, list):
            for i, supp in enumerate(supplements):
                rec = {
                    "priority": len(recs) + i + 1,
                    "category": "supplementation",
                    "title": supp.get("supplement", supp.get("name", "Supplement")),
                    "action": f"{supp.get('dosage', '')} {supp.get('frequency', 'daily')}".strip(),
                    "rationale": supp.get("rationale", supp.get("reasoning", "")),
                    "expected_timeline": supp.get("expected_timeline", "8-12 weeks"),
                    "sources": _extract_sources(supp)
                }
                recs.append(rec)
    
    # Ensure at least one recommendation
    if not recs:
        recs.append({
            "priority": 1,
            "category": "supplementation",
            "title": "Follow Research-Based Protocol",
            "action": "Implement evidence-based interventions",
            "rationale": "Based on research gathered",
            "expected_timeline": "8-12 weeks",
            "sources": []
        })
    
    return recs


def _map_category(cat: str) -> str:
    """Map model's category names to our schema categories."""
    cat_lower = cat.lower()
    
    valid_categories = ["diet", "exercise", "sleep", "stress", "supplementation", "medical"]
    
    # Direct match
    if cat_lower in valid_categories:
        return cat_lower
    
    # Fuzzy matching
    if "nutrition" in cat_lower or "food" in cat_lower:
        return "diet"
    if "supplement" in cat_lower or "vitamin" in cat_lower:
        return "supplementation"
    if "metabolic" in cat_lower:
        return "diet"
    if "physical" in cat_lower or "training" in cat_lower:
        return "exercise"
    
    return "supplementation"  # Default


def _extract_sources(item: Dict) -> List[Dict]:
    """Extract sources from item."""
    sources = []
    
    # Check 'source' field (singular)
    if "source" in item and item["source"]:
        sources.append({
            "title": item.get("evidence", "Research Source"),
            "url": item["source"]
        })
    
    # Check 'sources' field (plural)
    if "sources" in item and isinstance(item["sources"], list):
        for src in item["sources"]:
            if isinstance(src, dict):
                sources.append(src)
            elif isinstance(src, str):
                sources.append({"title": "Research Source", "url": src})
    
    return sources


def _extract_lifestyle(data: Dict) -> Dict:
    """Extract lifestyle interventions."""
    # If it exists, return it
    if "lifestyle_interventions" in data:
        lifestyle = data["lifestyle_interventions"]
        # Ensure all three required keys exist with correct structure
        return {
            "diet": _ensure_lifestyle_intervention(lifestyle.get("diet", {})),
            "exercise": _ensure_lifestyle_intervention(lifestyle.get("exercise", {})),
            "sleep": _ensure_lifestyle_intervention(lifestyle.get("sleep", {}))
        }
    
    # Build from lifestyle_modifications or lifestyle_protocols
    if "lifestyle_modifications" in data:
        mods = data["lifestyle_modifications"]
        return {
            "diet": _ensure_lifestyle_intervention(mods.get("nutrition_optimization", {})),
            "exercise": _ensure_lifestyle_intervention(mods.get("exercise_enhancement", {})),
            "sleep": _ensure_lifestyle_intervention(mods.get("sleep_optimization", {}))
        }
    
    # Default structure
    return {
        "diet": {
            "modifications": ["Follow Mediterranean diet principles"],
            "rationale": "Based on research gathered",
            "sources": []
        },
        "exercise": {
            "modifications": ["Increase activity to 5x per week"],
            "rationale": "Improves metabolic health",
            "sources": []
        },
        "sleep": {
            "modifications": ["Aim for 7.5-8 hours nightly"],
            "rationale": "Essential for recovery and health",
            "sources": []
        }
    }


def _ensure_lifestyle_intervention(data: Dict) -> Dict:
    """Ensure lifestyle intervention has required structure."""
    if not data:
        data = {}
    
    # Build modifications list
    modifications = []
    if "modifications" in data and isinstance(data["modifications"], list):
        modifications = data["modifications"]
    elif "recommendation" in data:
        modifications = [data["recommendation"]]
    elif "protocol" in data:
        modifications = [data["protocol"]]
    
    if not modifications:
        modifications = ["Follow evidence-based protocol"]
    
    return {
        "modifications": modifications,
        "rationale": data.get("rationale", data.get("reasoning", "Based on research")),
        "sources": _extract_sources(data)
    }


def _extract_monitoring(data: Dict) -> Dict:
    """Extract monitoring plan."""
    if "monitoring_plan" in data:
        plan = data["monitoring_plan"]
        
        # If it has the right structure
        if "retest_biomarkers" in plan:
            return {
                "retest_biomarkers": plan["retest_biomarkers"],
                "retest_timeline": plan.get("retest_timeline", "8-12 weeks"),
                "expected_improvements": plan.get("expected_improvements", [])
            }
        
        # Try to extract from other fields
        return {
            "retest_biomarkers": _extract_biomarker_list(plan),
            "retest_timeline": plan.get("quarterly_labs", plan.get("monthly_labs", "8-12 weeks")),
            "expected_improvements": _extract_expected_improvements(data)
        }
    
    # Default
    return {
        "retest_biomarkers": ["fasting_glucose", "HbA1c", "LDL_cholesterol", "vitamin_D"],
        "retest_timeline": "8-12 weeks",
        "expected_improvements": []
    }


def _extract_biomarker_list(plan: Dict) -> List[str]:
    """Extract list of biomarkers to retest."""
    # Check various possible fields
    for key in ["daily_tracking", "weekly_tracking", "monthly_labs"]:
        if key in plan and isinstance(plan[key], str):
            # Parse string for biomarker names
            text = plan[key].lower()
            markers = []
            if "glucose" in text:
                markers.append("fasting_glucose")
            if "hba1c" in text:
                markers.append("HbA1c")
            if "cholesterol" in text or "ldl" in text:
                markers.append("LDL_cholesterol")
            if "vitamin d" in text:
                markers.append("vitamin_D")
            if markers:
                return markers
    
    return ["all_biomarkers"]


def _extract_expected_improvements(data: Dict) -> List[Dict]:
    """Extract expected biomarker improvements."""
    improvements = []
    
    # Check expected_outcomes
    if "expected_outcomes" in data:
        outcomes = data["expected_outcomes"]
        for key, value in outcomes.items():
            if "weeks" in key or "months" in key:
                improvements.append({
                    "biomarker": "Overall Health",
                    "expected_change": value,
                    "timeline": key
                })
    
    # Check biomarker_specific_recommendations
    if "biomarker_specific_recommendations" in data:
        for rec in data["biomarker_specific_recommendations"]:
            improvements.append({
                "biomarker": rec.get("biomarker", ""),
                "expected_change": rec.get("target", "Improvement expected"),
                "timeline": rec.get("monitoring", "8-12 weeks")
            })
    
    return improvements
