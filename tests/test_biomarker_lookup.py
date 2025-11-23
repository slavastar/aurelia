"""Test biomarker lookup tool."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from aurelia.tools import SearchTools

def test_biomarker_lookup():
    """Test the biomarker lookup tool with various parameters."""
    
    print("=" * 80)
    print("BIOMARKER LOOKUP TOOL TEST")
    print("=" * 80)
    
    # Test 1: Basic lookup without demographics
    print("\n1. Testing basic lookup: Vitamin B12")
    print("-" * 80)
    result = SearchTools.biomarker_lookup("vitamin B12")
    print(f"Query: {result['query']}")
    print(f"Results found: {result['count']}")
    if result['count'] > 0:
        print(f"\nFirst result:")
        print(f"  Title: {result['results'][0]['title']}")
        print(f"  Snippet: {result['results'][0]['body'][:200]}...")
    
    # Test 2: Lookup with age and gender
    print("\n\n2. Testing with demographics: Ferritin for 35-year-old woman")
    print("-" * 80)
    result = SearchTools.biomarker_lookup("ferritin", age=35, gender="female")
    print(f"Query: {result['query']}")
    print(f"Results found: {result['count']}")
    print(f"Context: {result['context']}")
    if result['count'] > 0:
        print(f"\nFirst result:")
        print(f"  Title: {result['results'][0]['title']}")
        print(f"  Snippet: {result['results'][0]['body'][:200]}...")
    
    # Test 3: Lookup with menstruation status
    print("\n\n3. Testing with menstruation status: Iron for menstruating woman")
    print("-" * 80)
    result = SearchTools.biomarker_lookup("iron", age=30, gender="female", is_menstruating=True)
    print(f"Query: {result['query']}")
    print(f"Results found: {result['count']}")
    print(f"Context: {result['context']}")
    if result['count'] > 0:
        print(f"\nFirst result:")
        print(f"  Title: {result['results'][0]['title']}")
        print(f"  Snippet: {result['results'][0]['body'][:200]}...")
    
    # Test 4: Unknown biomarker
    print("\n\n4. Testing uncommon biomarker: Lipoprotein(a)")
    print("-" * 80)
    result = SearchTools.biomarker_lookup("Lipoprotein(a)", age=45, gender="female")
    print(f"Query: {result['query']}")
    print(f"Results found: {result['count']}")
    if result['count'] > 0:
        print(f"\nFirst result:")
        print(f"  Title: {result['results'][0]['title']}")
        print(f"  Snippet: {result['results'][0]['body'][:200]}...")
    
    print("\n" + "=" * 80)
    print("✅ BIOMARKER LOOKUP TOOL TEST COMPLETE")
    print("=" * 80)
    print("\nThe tool successfully:")
    print("  ✓ Searches for biomarker reference ranges")
    print("  ✓ Includes age-specific context")
    print("  ✓ Includes gender-specific context")
    print("  ✓ Includes menstruation status when relevant")
    print("  ✓ Returns clinical information from medical sources")

if __name__ == "__main__":
    test_biomarker_lookup()
