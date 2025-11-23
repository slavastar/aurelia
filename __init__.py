"""AURELIA - AI Health Recommendation Coach

A clean, maintainable health coaching system with web search integration.
"""

from .health_coach import HealthCoach
from .schemas import (
    HealthProfile,
    HealthReport,
    HealthReportWithMetadata,
    Recommendation,
    Supplement,
    Source
)
from .tools import SearchTools

__version__ = "1.0.0"
__all__ = [
    "HealthCoach",
    "HealthProfile",
    "HealthReport",
    "HealthReportWithMetadata",
    "Recommendation",
    "Supplement",
    "Source",
    "SearchTools"
]
