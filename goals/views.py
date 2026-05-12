from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.http import JsonResponse
from .models import Goal, Subtask
from .serializers import GoalSerializer, SubtaskSerializer, UserSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return Response({'status': 'success', 'user': username})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def user_logout(request):
    logout(request)
    return Response({'status': 'success'})


@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth(request):
    if request.user.is_authenticated:
        return Response({'authenticated': True, 'user': request.user.username})
    return Response({'authenticated': False})


# API регистрации
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Автоматически логиним пользователя после регистрации
        login(request, user)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'message': 'Регистрация успешна'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_subtask(self, request, pk=None):
        goal = self.get_object()
        title = request.data.get('title')
        
        if not title:
            return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        subtask = Subtask.objects.create(
            goal=goal,
            title=title,
            is_completed=False
        )
        
        serializer = SubtaskSerializer(subtask)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def complete_subtask(self, request, pk=None):
        subtask_id = request.data.get('subtask_id')
        try:
            subtask = Subtask.objects.get(id=subtask_id, goal_id=pk)
            subtask.is_completed = True
            from django.utils import timezone
            subtask.completed_at = timezone.now()
            subtask.save()
            return Response({'status': 'completed'})
        except Subtask.DoesNotExist:
            return Response({'error': 'Subtask not found'}, status=status.HTTP_404_NOT_FOUND)


class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subtask.objects.filter(goal__user=self.request.user)