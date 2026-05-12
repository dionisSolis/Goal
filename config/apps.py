from django.apps import AppConfig
from django.core.management import call_command
import sys


class ConfigConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'config'

    def ready(self):
        # Запускаем миграции при старте (кроме команд manage.py)
        if 'migrate' not in sys.argv and 'makemigrations' not in sys.argv and 'collectstatic' not in sys.argv:
            try:
                print("🔄 Checking and applying migrations...")
                call_command('migrate', interactive=False)
                print("✅ Migrations applied successfully")
            except Exception as e:
                print(f"⚠️ Warning: Could not apply migrations: {e}")