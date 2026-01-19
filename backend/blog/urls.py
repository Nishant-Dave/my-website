from django.urls import path
from .views import PendingCommentListView, ToggleApproveCommentView

urlpatterns = [
    path('moderation/comments/pending/', PendingCommentListView.as_view(), name='pending-comment-list'),
    path('moderation/comments/<int:pk>/toggle-approve/', ToggleApproveCommentView.as_view(), name='toggle-approve-comment'),
]