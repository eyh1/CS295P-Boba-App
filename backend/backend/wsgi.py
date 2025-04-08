"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import sys
import os
from django.core.wsgi import get_wsgi_application

# Add the top-level project dir to the path (the one with manage.py)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))



settings_module = 'backend.backend.deployment_settings' if 'RENDER_EXTERNAL_HOSTNAME' in os.environ else 'backend.backend.settings'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

application = get_wsgi_application()
