import sys
import os

# Add the parent directory to sys.path to allow importing from root
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root_dir)
# Add src to sys.path
sys.path.append(os.path.join(root_dir, 'src'))

from aurelia.api import app

# Configure root path for Vercel deployment
# This ensures FastAPI knows it's running behind a proxy/rewrite at /api/py
app.root_path = "/api/py"

# Vercel expects a variable named 'app' to be the WSGI/ASGI application
# or a function named 'handler'.
# Since FastAPI is ASGI, Vercel supports it natively if we expose 'app'.
