from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from goals.views import (
    GoalViewSet, SubtaskViewSet, user_login, user_logout, 
    check_auth, get_csrf_token, register
)

# Функция для корневого пути
def root_view(request):
    return JsonResponse({
        'message': 'Goal Tracker API',
        'endpoints': {
            'api': '/api/',
            'admin': '/admin/',
            'check_auth': '/api/check-auth/',
            'login': '/api/login/',
            'register': '/api/register/',
        }
    })

router = DefaultRouter()
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'subtasks', SubtaskViewSet, basename='subtask')

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/csrf/', get_csrf_token, name='csrf'),
    path('api/register/', register, name='register'),
    path('api/login/', user_login, name='login'),
    path('api/logout/', user_logout, name='logout'),
    path('api/check-auth/', check_auth, name='check_auth'),
]