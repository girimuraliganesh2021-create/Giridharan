"""
Direct Vercel Serverless Function entry point for /api/calculate
"""

from api.index import app

# Vercel WSGI entry point
# Exports the Flask WSGI app for the /api/calculate route
handler = app
