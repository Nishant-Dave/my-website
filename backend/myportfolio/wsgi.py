"""
WSGI config for myportfolio project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
import shutil
from django.core.wsgi import get_wsgi_application

# Vercel provides a read-only filesystem except for /tmp.
# We copy our bundled SQLite DB to /tmp so SQLite can create temporary lock files.
if os.environ.get('VERCEL') == '1' or os.environ.get('VERCEL_ENV'):
    base_dir = os.path.dirname(os.path.dirname(__file__))
    source_db = os.path.join(base_dir, 'db.sqlite3')
    target_db = '/tmp/db.sqlite3'
    
    if os.path.exists(source_db):
        try:
            shutil.copy2(source_db, target_db)
            # Update the environment so decouple's config('DATABASE_URL') picks it up
            os.environ['DATABASE_URL'] = f'sqlite:///{target_db}'
        except Exception as e:
            print("Warning: Failed to copy db.sqlite3 to /tmp:", e)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myportfolio.settings')

application = get_wsgi_application()

app = application
