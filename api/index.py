import sys
import os

# Add the parent directory to sys.path to allow importing from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_main import app

# Vercel expects a variable named 'app' to be the WSGI/ASGI application
# or a function named 'handler'.
# Since FastAPI is ASGI, Vercel supports it natively if we expose 'app'.
