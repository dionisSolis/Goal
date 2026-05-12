from rest_framework import serializers
from .models import Goal, Subtask


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ['id', 'goal', 'title', 'is_completed', 'completed_at', 'created_at']
        read_only_fields = ['id', 'completed_at', 'created_at']
        extra_kwargs = {
            'goal': {'required': False}  # goal будет установлен автоматически
        }


class GoalSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ('user', 'progress_percent', 'created_at', 'updated_at')