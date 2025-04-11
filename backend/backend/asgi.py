"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import sys
import os
from django.core.asgi import get_asgi_application

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

settings_module = 'backend.deployment_settings' if 'RENDER_EXTERNAL_HOSTNAME' in os.environ else 'backend.settings'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

application = get_asgi_application()
