from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Goal, Subtask


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ['id', 'goal', 'title', 'is_completed', 'completed_at', 'created_at']
        read_only_fields = ['id', 'completed_at', 'created_at']
        extra_kwargs = {
            'goal': {'required': False}
        }


class GoalSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ('user', 'progress_percent', 'created_at', 'updated_at')