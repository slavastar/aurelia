"""AURELIA Health Coach - AI-powered health optimization system."""

__version__ = "1.0.0"

from .health_coach import HealthCoach
from .schemas import (
    HealthProfile,
    HealthReport,
    HealthReportWithMetadata,
    MetabolicScoreResult,
    InflammationScoreResult,
    OxygenScoreResult,
    Recommendation,
    Source
)

__all__ = [
    "HealthCoach",
    "HealthProfile",
    "HealthReport",
    "HealthReportWithMetadata",
    "MetabolicScoreResult",
    "InflammationScoreResult",
    "OxygenScoreResult",
    "Recommendation",
    "Source",
]
