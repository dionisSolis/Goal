from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone


class Goal(models.Model):
    STATUS_CHOICES = [
        ('active', 'Активна'),
        ('completed', 'Завершена'),
        ('archived', 'Архив'),
        ('failed', 'Провалена'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    deadline = models.DateField(null=True, blank=True)
    criterion = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    progress_percent = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    def update_progress(self):
        """Обновляет процент выполнения на основе подзадач"""
        subtasks = self.subtasks.all()
        if subtasks.count() == 0:
            self.progress_percent = 0
        else:
            completed = subtasks.filter(is_completed=True).count()
            self.progress_percent = int((completed / subtasks.count()) * 100)
        
        # Если цель достигла 100% и ещё не завершена — автоматически завершаем
        if self.progress_percent >= 100 and self.status == 'active':
            self.status = 'completed'
        
        self.save(update_fields=['progress_percent', 'status', 'updated_at'])


class Subtask(models.Model):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.goal.title})"
    
    def save(self, *args, **kwargs):
        if self.is_completed and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)


# Сигналы: при изменении подзадачи обновляем прогресс цели
@receiver([post_save, post_delete], sender=Subtask)
def update_goal_progress(sender, instance, **kwargs):
    instance.goal.update_progress()