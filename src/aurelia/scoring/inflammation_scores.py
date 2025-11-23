"""
Inflammation Score Calculator for Women
Quantifies systemic inflammation vs recovery state.

Score ranges:
- 80-100 (optimal): Low inflammation, excellent recovery
- 60-79 (good): Mild systemic stress
- <60 (needs_improvement): High inflammatory load, poor recovery
"""

from typing import Dict, Optional, Any
import re


class InflammationScore:
    """Calculate inflammation scores for menstruating and non-menstruating women."""
    
    # Population means and standard deviations
    # Premenopausal women (menstruating)
    PREMENOPAUSAL_MEANS = {
        'hscrp': 0.8,      # mg/L - lower inflammation baseline
        'esr': 12,         # mm/h - younger women have lower ESR
        'ferritin': 35,    # µg/L - lower due to menstruation
        'wbc': 6.5         # x10^9/L
    }
    
    PREMENOPAUSAL_SDS = {
        'hscrp': 0.8,
        'esr': 8,
        'ferritin': 20,
        'wbc': 2.0
    }
    
    # Postmenopausal women (non-menstruating)
    POSTMENOPAUSAL_MEANS = {
        'hscrp': 1.5,      # mg/L - higher baseline inflammation
        'esr': 20,         # mm/h - ESR rises with age
        'ferritin': 100,   # µg/L - rises with menopause
        'wbc': 6.5         # x10^9/L
    }
    
    POSTMENOPAUSAL_SDS = {
        'hscrp': 1.0,
        'esr': 10,
        'ferritin': 50,
        'wbc': 2.0
    }
    
    # Weights for each marker (sum = 1.0)
    WEIGHTS = {
        'hscrp': 0.40,     # Most specific for inflammation
        'esr': 0.25,
        'ferritin': 0.20,  # Only high ferritin indicates inflammation
        'wbc': 0.15
    }
    
    SEVERITY_SCALE = 18  # Penalty strength multiplier
    
    @staticmethod
    def parse_biomarker(value: Any) -> Optional[float]:
        """Extract numeric value from string or number."""
        if value is None:
            return None
        
        if isinstance(value, (int, float)):
            return float(value)
        
        # Extract number from string like "0.4 mg/L" or "10 mm/h"
        match = re.search(r'[-+]?\d*\.?\d+', str(value))
        if match:
            return float(match.group())
        
        return None
    
    @staticmethod
    def convert_units(value: float, marker: str, unit: str) -> float:
        """
        Convert biomarker units to standard units.
        
        Standard units:
        - hsCRP: mg/L
        - ESR: mm/h
        - Ferritin: µg/L (or ng/mL, same numeric value)
        - WBC: x10^9/L
        """
        marker_lower = marker.lower()
        unit_lower = unit.lower() if unit else ''
        
        # hsCRP conversions
        if 'hscrp' in marker_lower or 'crp' in marker_lower:
            if 'mg/dl' in unit_lower:
                return value * 10  # mg/dL to mg/L
            # mg/L is standard, no conversion needed
            return value
        
        # Ferritin conversions
        if 'ferritin' in marker_lower:
            # µg/L and ng/mL are numerically equivalent
            # Most common units, no conversion needed
            return value
        
        # ESR and WBC typically don't need conversion
        return value
    
    @staticmethod
    def calculate_z_scores(
        biomarkers: Dict[str, float],
        is_menstruating: bool
    ) -> Dict[str, float]:
        """
        Calculate z-scores for inflammation markers.
        Only positive z-scores are kept (higher = worse inflammation).
        
        Note: For ferritin, only HIGH values indicate inflammation.
        Low ferritin indicates iron deficiency, not inflammation.
        """
        means = (InflammationScore.PREMENOPAUSAL_MEANS if is_menstruating 
                else InflammationScore.POSTMENOPAUSAL_MEANS)
        sds = (InflammationScore.PREMENOPAUSAL_SDS if is_menstruating 
              else InflammationScore.POSTMENOPAUSAL_SDS)
        
        z_scores = {}
        
        for marker in ['hscrp', 'esr', 'ferritin', 'wbc']:
            if marker in biomarkers:
                value = biomarkers[marker]
                z = (value - means[marker]) / sds[marker]
                # Only keep positive z-scores (higher = worse)
                z_scores[marker] = max(0, z)
            else:
                z_scores[marker] = None
        
        return z_scores
    
    @staticmethod
    def calculate_score(z_scores: Dict[str, Optional[float]]) -> tuple[float, int]:
        """
        Calculate inflammation score from z-scores.
        Returns (score, markers_used).
        
        Score calculation:
        - Start at 100 (perfect)
        - Apply weighted penalty based on positive z-scores
        - Higher inflammation markers = lower score
        """
        penalty = 0.0
        markers_used = 0
        total_weight_used = 0.0
        
        for marker, z in z_scores.items():
            if z is not None:
                weight = InflammationScore.WEIGHTS[marker]
                penalty += weight * z
                markers_used += 1
                total_weight_used += weight
        
        if markers_used == 0:
            return 0.0, 0
        
        # Scale penalty
        penalty *= InflammationScore.SEVERITY_SCALE
        
        # Calculate score (0-100)
        score = max(0, min(100, 100 - penalty))
        
        return round(score, 1), markers_used
    
    @staticmethod
    def get_interpretation(
        score: float,
        z_scores: Dict[str, Optional[float]]
    ) -> tuple[str, str, str]:
        """
        Get interpretation of inflammation score.
        Returns (level, description, summary).
        """
        if score >= 80:
            level = "optimal"
            description = "Low inflammation, excellent recovery capacity"
            summary = ("Your body shows excellent recovery capacity and low baseline inflammation. "
                      "You're adapting well to training and lifestyle stress.")
        elif score >= 60:
            level = "good"
            description = "Mild systemic stress or recent inflammation"
            summary = ("Slight inflammation may indicate recent intense training, poor sleep, or psychological stress. "
                      "Consider active recovery, sauna/cold exposure, and antioxidant-rich foods.")
        else:
            level = "needs_improvement"
            description = "High inflammatory load, compromised recovery"
            summary = ("Your body shows signs of systemic inflammation. This could stem from overtraining, "
                      "infection, poor gut health, or inadequate recovery. Scale back training intensity "
                      "and focus on restoration.")
        
        return level, description, summary
    
    @staticmethod
    def extract_inflammation_biomarkers(
        biomarkers: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        Extract and convert inflammation-related biomarkers.
        
        Expected keys (case-insensitive):
        - hsCRP or CRP: high-sensitivity C-reactive protein (mg/L)
        - ESR: erythrocyte sedimentation rate (mm/h)
        - Ferritin: ferritin (µg/L or ng/mL)
        - WBC: white blood cell count (x10^9/L)
        """
        inflammation_markers = {}
        
        # Map various possible key names
        key_mappings = {
            'hscrp': ['hscrp', 'hs_crp', 'crp', 'c_reactive_protein', 'hsCRP'],
            'esr': ['esr', 'sed_rate', 'sedimentation_rate'],
            'ferritin': ['ferritin', 'serum_ferritin'],
            'wbc': ['wbc', 'white_blood_cells', 'leucocytes', 'leukocytes']
        }
        
        for standard_key, possible_keys in key_mappings.items():
            for key in possible_keys:
                # Case-insensitive search
                for biomarker_key, biomarker_value in biomarkers.items():
                    if biomarker_key.lower().replace(' ', '_') == key:
                        parsed_value = InflammationScore.parse_biomarker(biomarker_value)
                        if parsed_value is not None:
                            # Try to detect unit from string
                            unit = ''
                            if isinstance(biomarker_value, str):
                                # Extract unit part
                                unit_match = re.search(r'[a-zA-Z/]+', str(biomarker_value))
                                if unit_match:
                                    unit = unit_match.group()
                            
                            # Convert to standard units
                            converted_value = InflammationScore.convert_units(
                                parsed_value, standard_key, unit
                            )
                            inflammation_markers[standard_key] = converted_value
                            break
                
                if standard_key in inflammation_markers:
                    break
        
        return inflammation_markers
    
    @staticmethod
    def compute_inflammation_score(
        biomarkers: Dict[str, Any],
        is_menstruating: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Main entry point to compute inflammation score.
        
        Args:
            biomarkers: Dictionary of biomarker values
            is_menstruating: True for premenopausal/menstruating women,
                           False for postmenopausal women
        
        Returns:
            Dictionary with score details or None if insufficient data
        """
        # Extract inflammation biomarkers
        inflammation_markers = InflammationScore.extract_inflammation_biomarkers(biomarkers)
        
        # Need at least 2 markers to calculate score
        if len(inflammation_markers) < 2:
            return None
        
        # Calculate z-scores
        z_scores = InflammationScore.calculate_z_scores(
            inflammation_markers,
            is_menstruating
        )
        
        # Calculate score
        score, markers_used = InflammationScore.calculate_score(z_scores)
        
        if markers_used < 2:
            return None
        
        # Get interpretation
        level, description, summary = InflammationScore.get_interpretation(score, z_scores)
        
        # Build result
        result = {
            'score': score,
            'markers_used': markers_used,
            'level': level,
            'description': description,
            'summary': summary,
            'is_menstruating': is_menstruating,
            'components': {
                'hscrp': inflammation_markers.get('hscrp'),
                'esr': inflammation_markers.get('esr'),
                'ferritin': inflammation_markers.get('ferritin'),
                'wbc': inflammation_markers.get('wbc')
            }
        }
        
        return result
