"""Pydantic models for health data and reports."""

from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class HealthProfile(BaseModel):
    """Health profile with biomarkers and lifestyle data."""
    age: int
    height: int  # cm
    weight: int  # kg
    bioage: float
    lifestyle_quiz: dict
    biomarkers: dict


class Source(BaseModel):
    """Reference source for recommendations."""
    title: str
    url: str


class Recommendation(BaseModel):
    """Individual health recommendation."""
    priority: int
    category: Literal["diet", "exercise", "sleep", "stress", "supplementation", "medical"]
    title: str
    action: str
    rationale: str
    expected_timeline: str
    sources: List[Source] = Field(default_factory=list)


class Supplement(BaseModel):
    """Supplement protocol entry."""
    supplement: str
    dosage: str
    frequency: str
    rationale: str
    target_biomarkers: List[str]
    sources: List[Source] = Field(default_factory=list)


class LifestyleIntervention(BaseModel):
    """Lifestyle intervention details."""
    modifications: List[str]
    rationale: str
    sources: List[Source] = Field(default_factory=list)


class LifestyleInterventions(BaseModel):
    """Complete lifestyle intervention plan."""
    diet: LifestyleIntervention
    exercise: LifestyleIntervention
    sleep: LifestyleIntervention


class BiomarkerExpectation(BaseModel):
    """Expected biomarker improvement."""
    biomarker: str
    expected_change: str
    timeline: str


class MonitoringPlan(BaseModel):
    """Biomarker monitoring and tracking plan."""
    retest_biomarkers: List[str]
    retest_timeline: str
    expected_improvements: List[BiomarkerExpectation]


class BiomarkerFinding(BaseModel):
    """Individual biomarker finding."""
    biomarker: str
    value: str
    status: Literal["elevated", "low", "normal", "optimal"]
    concern_level: Literal["low", "medium", "high"]


class HealthAssessment(BaseModel):
    """Overall health assessment."""
    bioage_gap: float
    bioage_gap_description: str
    key_findings: List[BiomarkerFinding]
    overall_health_status: str
    primary_risks: List[str]


class HealthReport(BaseModel):
    """Complete health optimization report."""
    health_assessment: HealthAssessment
    recommendations: List[Recommendation]
    supplement_protocol: List[Supplement]
    lifestyle_interventions: LifestyleInterventions
    monitoring_plan: MonitoringPlan


class HealthReportWithMetadata(BaseModel):
    """Health report with metadata for file saving."""
    generated_at: datetime
    health_profile: HealthProfile
    report: HealthReport

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
