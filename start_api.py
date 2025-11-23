"""Simple script to start the API server."""

import subprocess
import sys
import os

# Ensure we're in the right directory
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

print("Starting AURELIA Health Coach API...")
print("Server will be available at: http://localhost:8000")
print("Interactive docs at: http://localhost:8000/docs")
print("\nPress CTRL+C to stop the server\n")

try:
    subprocess.run([sys.executable, "-m", "uvicorn", "api:app", "--reload"])
except KeyboardInterrupt:
    print("\nServer stopped.")
except FileNotFoundError:
    print("\nError: uvicorn not found. Installing...")
    subprocess.run([sys.executable, "-m", "pip", "install", "uvicorn[standard]"])
    print("\nPlease run this script again.")
