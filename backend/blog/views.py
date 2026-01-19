from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, status
from django_shortcuts import get_object_or_404

from.models import Comment
from .serializers import CommentSerializer
from blog.permissions import IsStaff


class PendingCommentListView(generics.ListAPIView):
    queryset = Comment.objects.filter(is_approved=False).order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [IsStaff]

class ToggleApproveCommentView(APIView):
    permission_classes = [IsStaff]

    def patch(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        comment.is_approved = not comment.is_approved
        comment.save()
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_200_OK)