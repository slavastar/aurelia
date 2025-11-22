
import pandas as pd

try:
    df = pd.read_csv("backend/data/person_1.csv")
    print(f"Successfully read CSV. Shape: {df.shape}")
    print(f"Columns: {len(df.columns)}")
except Exception as e:
    print(f"Error reading CSV: {e}")
