"""
Oxygen Score Calculator
Evaluates blood's capacity to transport oxygen efficiently to muscles and organs.

Score ranges:
- 80-100 (optimal): Excellent oxygen transport, optimal endurance potential
- 60-79 (good): Slight reduction, may slightly limit performance
- <60 (needs_improvement): Low oxygen capacity, affects stamina and recovery
"""

from typing import Dict, Optional, Any
import re


class OxygenScore:
    """Calculate oxygen transport capacity score."""
    
    # Population means and standard deviations for adult women
    MEANS = {
        'hemoglobin': 13.5,    # g/dL - primary oxygen carrier
        'hematocrit': 41,      # % - red blood cell volume
        'rbc': 4.5,            # x10^12/L - red blood cell count
        'iron': 90             # µg/dL - iron availability
    }
    
    SDS = {
        'hemoglobin': 1.2,
        'hematocrit': 3.5,
        'rbc': 0.35,
        'iron': 25
    }
    
    # Weights for each marker (sum = 1.0)
    WEIGHTS = {
        'hemoglobin': 0.40,    # Strongest predictor of oxygen capacity
        'hematocrit': 0.25,
        'rbc': 0.20,
        'iron': 0.15
    }
    
    SEVERITY_SCALE = 22  # Penalty strength multiplier
    
    @staticmethod
    def parse_biomarker(value: Any) -> Optional[float]:
        """Extract numeric value from string or number."""
        if value is None:
            return None
        
        if isinstance(value, (int, float)):
            return float(value)
        
        # Extract number from string like "13.2 g/dL" or "40 %"
        match = re.search(r'[-+]?\d*\.?\d+', str(value))
        if match:
            return float(match.group())
        
        return None
    
    @staticmethod
    def convert_units(value: float, marker: str, unit: str) -> float:
        """
        Convert biomarker units to standard units.
        
        Standard units:
        - Hemoglobin: g/dL
        - Hematocrit: %
        - RBC: x10^12/L
        - Iron: µg/dL
        """
        marker_lower = marker.lower()
        unit_lower = unit.lower() if unit else ''
        
        # Hemoglobin conversions
        if 'hemoglobin' in marker_lower or 'hb' in marker_lower or 'hgb' in marker_lower:
            if 'g/l' in unit_lower and 'g/dl' not in unit_lower:
                return value / 10  # g/L to g/dL
            if 'mmol/l' in unit_lower:
                return value * 1.611  # mmol/L to g/dL
            # g/dL is standard
            return value
        
        # Hematocrit conversions
        if 'hematocrit' in marker_lower or 'hct' in marker_lower:
            if 0 <= value <= 1:
                # Fraction to percentage
                return value * 100
            # Already in %
            return value
        
        # RBC conversions
        if 'rbc' in marker_lower or 'red_blood_cell' in marker_lower:
            if 'x10^6' in unit_lower or '10^6' in unit_lower or 'million' in unit_lower:
                return value / 1000  # x10^6/µL to x10^12/L
            # x10^12/L is standard
            return value
        
        # Iron conversions
        if 'iron' in marker_lower or 'serum_iron' in marker_lower:
            if 'µmol/l' in unit_lower or 'umol/l' in unit_lower:
                return value * 5.587  # µmol/L to µg/dL
            if 'µg/l' in unit_lower or 'ug/l' in unit_lower:
                return value / 10  # µg/L to µg/dL
            # µg/dL is standard
            return value
        
        return value
    
    @staticmethod
    def calculate_z_scores(biomarkers: Dict[str, float]) -> Dict[str, float]:
        """
        Calculate z-scores for oxygen transport markers.
        Only NEGATIVE z-scores are kept (lower = worse oxygen transport).
        
        Note: High values are NOT penalized - only low values reduce score.
        This targets anemia/oxygen deficiency, not polycythemia.
        """
        z_scores = {}
        
        for marker in ['hemoglobin', 'hematocrit', 'rbc', 'iron']:
            if marker in biomarkers:
                value = biomarkers[marker]
                z = (value - OxygenScore.MEANS[marker]) / OxygenScore.SDS[marker]
                # Only keep negative z-scores (lower = worse)
                # Convert to absolute value for penalty calculation
                z_scores[marker] = abs(min(0, z))
            else:
                z_scores[marker] = None
        
        return z_scores
    
    @staticmethod
    def calculate_score(z_scores: Dict[str, Optional[float]]) -> tuple[float, int]:
        """
        Calculate oxygen transport score from z-scores.
        Returns (score, markers_used).
        
        Score calculation:
        - Start at 100 (perfect)
        - Apply weighted penalty based on how far below normal
        - Lower oxygen markers = lower score
        """
        penalty = 0.0
        markers_used = 0
        
        for marker, z in z_scores.items():
            if z is not None:
                weight = OxygenScore.WEIGHTS[marker]
                penalty += weight * z
                markers_used += 1
        
        if markers_used == 0:
            return 0.0, 0
        
        # Scale penalty
        penalty *= OxygenScore.SEVERITY_SCALE
        
        # Calculate score (0-100)
        score = max(0, min(100, 100 - penalty))
        
        return round(score, 1), markers_used
    
    @staticmethod
    def get_interpretation(
        score: float,
        biomarkers: Dict[str, Optional[float]]
    ) -> tuple[str, str, str]:
        """
        Get interpretation of oxygen score.
        Returns (level, description, summary).
        """
        if score >= 80:
            level = "optimal"
            description = "Excellent oxygen transport capacity"
            summary = ("Your blood carries oxygen efficiently — excellent endurance potential. "
                      "Your hemoglobin and iron levels support optimal oxygen delivery to tissues.")
        elif score >= 60:
            level = "good"
            description = "Slight reduction in oxygen transport markers"
            summary = ("Slight reduction in iron or hemoglobin — may slightly limit performance. "
                      "Consider monitoring iron intake, especially if you're very active or have heavy menstrual cycles.")
        else:
            level = "needs_improvement"
            description = "Low oxygen transport capacity"
            summary = ("Low hemoglobin or ferritin — could affect stamina and recovery. "
                      "Consider iron supplementation and medical evaluation to rule out anemia. "
                      "Low oxygen capacity can cause fatigue, poor endurance, and delayed recovery.")
        
        return level, description, summary
    
    @staticmethod
    def extract_oxygen_biomarkers(biomarkers: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract and convert oxygen transport-related biomarkers.
        
        Expected keys (case-insensitive):
        - Hemoglobin or Hb or HGB: hemoglobin concentration (g/dL)
        - Hematocrit or Hct: hematocrit percentage (%)
        - RBC: red blood cell count (x10^12/L)
        - Iron or Serum Iron: serum iron level (µg/dL)
        """
        oxygen_markers = {}
        
        # Map various possible key names
        key_mappings = {
            'hemoglobin': ['hemoglobin', 'hb', 'hgb', 'haemoglobin'],
            'hematocrit': ['hematocrit', 'hct', 'haematocrit'],
            'rbc': ['rbc', 'red_blood_cells', 'red_blood_cell_count', 'erythrocytes'],
            'iron': ['iron', 'serum_iron', 'fe', 'serum_fe']
        }
        
        for standard_key, possible_keys in key_mappings.items():
            for key in possible_keys:
                # Case-insensitive search
                for biomarker_key, biomarker_value in biomarkers.items():
                    if biomarker_key.lower().replace(' ', '_') == key:
                        parsed_value = OxygenScore.parse_biomarker(biomarker_value)
                        if parsed_value is not None:
                            # Try to detect unit from string
                            unit = ''
                            if isinstance(biomarker_value, str):
                                # Extract unit part
                                unit_match = re.search(r'[a-zA-Z/^%]+', str(biomarker_value))
                                if unit_match:
                                    unit = unit_match.group()
                            
                            # Convert to standard units
                            converted_value = OxygenScore.convert_units(
                                parsed_value, standard_key, unit
                            )
                            oxygen_markers[standard_key] = converted_value
                            break
                
                if standard_key in oxygen_markers:
                    break
        
        return oxygen_markers
    
    @staticmethod
    def compute_oxygen_score(biomarkers: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Main entry point to compute oxygen transport score.
        
        Args:
            biomarkers: Dictionary of biomarker values
        
        Returns:
            Dictionary with score details or None if insufficient data
        """
        # Extract oxygen transport biomarkers
        oxygen_markers = OxygenScore.extract_oxygen_biomarkers(biomarkers)
        
        # Need at least 2 markers to calculate score
        if len(oxygen_markers) < 2:
            return None
        
        # Calculate z-scores
        z_scores = OxygenScore.calculate_z_scores(oxygen_markers)
        
        # Calculate score
        score, markers_used = OxygenScore.calculate_score(z_scores)
        
        if markers_used < 2:
            return None
        
        # Get interpretation
        level, description, summary = OxygenScore.get_interpretation(score, oxygen_markers)
        
        # Build result
        result = {
            'score': score,
            'markers_used': markers_used,
            'level': level,
            'description': description,
            'summary': summary,
            'components': {
                'hemoglobin': oxygen_markers.get('hemoglobin'),
                'hematocrit': oxygen_markers.get('hematocrit'),
                'rbc': oxygen_markers.get('rbc'),
                'iron': oxygen_markers.get('iron')
            }
        }
        
        return result
