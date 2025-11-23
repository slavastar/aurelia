"""
Metabolic scoring system for health assessment.
"""
from typing import Dict, Any, Optional, Tuple


class MetabolicScore:
    """Calculate metabolic efficiency score from biomarkers."""
    
    # Population means & standard deviations (can be gender-specific later)
    POPULATION_STATS = {
        'homa': {'mean': 1.46, 'sd': 0.8},
        'tg_hdl': {'mean': 2.0, 'sd': 1.0},
        'apob_a1': {'mean': 0.9, 'sd': 0.3},
        'hba1c': {'mean': 5.3, 'sd': 0.4}
    }
    
    # Weights for each component
    WEIGHTS = {
        'homa': 0.4,
        'tg_hdl': 0.3,
        'apob_a1': 0.2,
        'hba1c': 0.1
    }
    
    SCALE = 15  # Penalty scaling factor
    
    @staticmethod
    def parse_biomarker(value: str, unit_conversions: Dict[str, float] = None) -> Optional[float]:
        """
        Parse biomarker value from string format.
        
        Args:
            value: String like "102 mg/dL" or "5.8%"
            unit_conversions: Optional dict for unit conversion
            
        Returns:
            Numeric value or None if parsing fails
        """
        if not value:
            return None
        
        # Remove common suffixes
        value_str = str(value).strip()
        for suffix in [' mg/dL', ' mg/dl', 'mg/dL', 'mg/dl', ' g/L', ' g/l', 'g/L', 'g/l', 
                       ' mmol/L', ' mmol/l', 'mmol/L', 'mmol/l', ' µIU/mL', ' uIU/mL', '%']:
            value_str = value_str.replace(suffix, '').strip()
        
        try:
            return float(value_str)
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def convert_units(biomarkers: Dict[str, str]) -> Dict[str, Optional[float]]:
        """
        Convert biomarker units to standard format.
        
        Expected biomarkers:
        - fasting_glucose: mg/dL or mmol/L
        - fasting_insulin: µIU/mL
        - triglycerides: mg/dL or g/L
        - HDL_cholesterol: mg/dL or g/L
        - ApoB: mg/dL or g/L
        - ApoA1: mg/dL or g/L
        - HbA1c: %
        
        Returns:
            Dict with standardized numeric values
        """
        result = {}
        
        # Glucose: convert to mmol/L if in mg/dL
        glucose_str = biomarkers.get('fasting_glucose', '')
        glucose_val = MetabolicScore.parse_biomarker(glucose_str)
        if glucose_val and glucose_val > 20:  # Likely mg/dL
            result['glucose_mmol'] = glucose_val / 18.0
        elif glucose_val:
            result['glucose_mmol'] = glucose_val
        else:
            result['glucose_mmol'] = None
        
        # Insulin: µIU/mL (direct)
        insulin_str = biomarkers.get('fasting_insulin', '')
        result['insulin_u'] = MetabolicScore.parse_biomarker(insulin_str)
        
        # Triglycerides: convert to mg/dL if in g/L
        tg_str = biomarkers.get('triglycerides', '')
        tg_val = MetabolicScore.parse_biomarker(tg_str)
        if tg_val and tg_val < 10:  # Likely g/L
            result['tg_mgdl'] = tg_val * 100
        elif tg_val:
            result['tg_mgdl'] = tg_val
        else:
            result['tg_mgdl'] = None
        
        # HDL: convert to mg/dL if in g/L
        hdl_str = biomarkers.get('HDL_cholesterol', '')
        hdl_val = MetabolicScore.parse_biomarker(hdl_str)
        if hdl_val and hdl_val < 5:  # Likely g/L
            result['hdl_mgdl'] = hdl_val * 100
        elif hdl_val:
            result['hdl_mgdl'] = hdl_val
        else:
            result['hdl_mgdl'] = None
        
        # ApoB: convert to mg/dL if in g/L
        apob_str = biomarkers.get('ApoB', '')
        apob_val = MetabolicScore.parse_biomarker(apob_str)
        if apob_val and apob_val < 5:  # Likely g/L
            result['apob_mgdl'] = apob_val * 100
        elif apob_val:
            result['apob_mgdl'] = apob_val
        else:
            result['apob_mgdl'] = None
        
        # ApoA1: convert to mg/dL if in g/L
        apoa1_str = biomarkers.get('ApoA1', '')
        apoa1_val = MetabolicScore.parse_biomarker(apoa1_str)
        if apoa1_val and apoa1_val < 5:  # Likely g/L
            result['apoa1_mgdl'] = apoa1_val * 100
        elif apoa1_val:
            result['apoa1_mgdl'] = apoa1_val
        else:
            result['apoa1_mgdl'] = None
        
        # HbA1c: % (direct)
        hba1c_str = biomarkers.get('HbA1c', '')
        result['hba1c'] = MetabolicScore.parse_biomarker(hba1c_str)
        
        return result
    
    @staticmethod
    def calculate_derived_markers(values: Dict[str, Optional[float]]) -> Dict[str, Optional[float]]:
        """Calculate derived metabolic markers."""
        derived = {}
        
        # HOMA-IR: (glucose_mmol × insulin_u) / 22.5
        if values.get('glucose_mmol') and values.get('insulin_u'):
            derived['homa'] = (values['glucose_mmol'] * values['insulin_u']) / 22.5
        else:
            derived['homa'] = None
        
        # TG/HDL ratio
        if values.get('tg_mgdl') and values.get('hdl_mgdl'):
            derived['tg_hdl'] = values['tg_mgdl'] / values['hdl_mgdl']
        else:
            derived['tg_hdl'] = None
        
        # ApoB/ApoA1 ratio
        if values.get('apob_mgdl') and values.get('apoa1_mgdl'):
            derived['apob_a1'] = values['apob_mgdl'] / values['apoa1_mgdl']
        else:
            derived['apob_a1'] = None
        
        return derived
    
    @staticmethod
    def calculate_z_scores(derived: Dict[str, Optional[float]]) -> Dict[str, Optional[float]]:
        """Calculate z-scores for each metabolic marker."""
        z_scores = {}
        
        for marker in ['homa', 'tg_hdl', 'apob_a1', 'hba1c']:
            value = derived.get(marker)
            if value is not None:
                stats = MetabolicScore.POPULATION_STATS[marker]
                z = (value - stats['mean']) / stats['sd']
                # Keep only positive z-scores (higher = worse)
                z_scores[marker] = max(0, z)
            else:
                z_scores[marker] = None
        
        return z_scores
    
    @staticmethod
    def calculate_score(z_scores: Dict[str, Optional[float]]) -> Tuple[Optional[float], int]:
        """
        Calculate final metabolic efficiency score.
        
        Returns:
            Tuple of (score, num_markers_used)
            Score: 0-100 where 100 is optimal
            num_markers_used: Number of markers that contributed to score
        """
        # Calculate weighted penalty
        total_weight = 0
        penalty = 0
        markers_used = 0
        
        for marker, weight in MetabolicScore.WEIGHTS.items():
            z = z_scores.get(marker)
            if z is not None:
                penalty += weight * z
                total_weight += weight
                markers_used += 1
        
        if markers_used == 0:
            return None, 0
        
        # Normalize penalty if not all markers available
        if total_weight > 0 and total_weight < 1.0:
            penalty = penalty / total_weight
        
        # Calculate score
        penalty_scaled = MetabolicScore.SCALE * penalty
        score = max(0, min(100, 100 - penalty_scaled))
        
        return round(score, 1), markers_used
    
    @staticmethod
    def get_interpretation(score: float) -> Dict[str, str]:
        """
        Get interpretation of metabolic efficiency score.
        
        Returns:
            Dict with 'level', 'description', and 'summary' keys
        """
        if score >= 85:
            return {
                'level': 'optimal',
                'description': 'Low fasting insulin, stable glucose, low TG/HDL, good ApoB/A1 ratio',
                'summary': 'Your body efficiently maintains stable glucose and lipid levels with minimal insulin. Excellent metabolic flexibility — your cells respond well to insulin and energy balance is stable.'
            }
        elif score >= 65:
            return {
                'level': 'good',
                'description': 'Slightly elevated fasting insulin or TG/HDL ratio',
                'summary': 'Your body is starting to require more insulin to maintain balance. Improving sleep, stress management, and meal timing could help.'
            }
        else:
            return {
                'level': 'needs_improvement',
                'description': 'High insulin, high TG/HDL, elevated HbA1c and ApoB/A1 ratio',
                'summary': 'Your metabolism is less efficient — your body needs more insulin to control glucose, and lipid handling shows early resistance. This can precede prediabetes or cardiovascular risk.'
            }
    
    @staticmethod
    def compute_metabolic_score(biomarkers: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """
        Main function to compute metabolic efficiency score from biomarkers.
        
        Args:
            biomarkers: Dict of biomarker names to values (as strings with units)
            
        Returns:
            Dict with score, interpretation, and component details, or None if insufficient data
        """
        # Convert units
        values = MetabolicScore.convert_units(biomarkers)
        
        # Calculate derived markers
        derived = MetabolicScore.calculate_derived_markers(values)
        
        # Add HbA1c to derived if available
        if values.get('hba1c'):
            derived['hba1c'] = values['hba1c']
        
        # Calculate z-scores
        z_scores = MetabolicScore.calculate_z_scores(derived)
        
        # Calculate final score
        score, markers_used = MetabolicScore.calculate_score(z_scores)
        
        if score is None:
            return None
        
        # Get interpretation
        interpretation = MetabolicScore.get_interpretation(score)
        
        return {
            'score': score,
            'markers_used': markers_used,
            'level': interpretation['level'],
            'description': interpretation['description'],
            'summary': interpretation['summary'],
            'components': {
                'homa_ir': derived.get('homa'),
                'tg_hdl_ratio': derived.get('tg_hdl'),
                'apob_a1_ratio': derived.get('apob_a1'),
                'hba1c': derived.get('hba1c')
            }
        }
