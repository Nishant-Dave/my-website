from rest_framework import serializers
from .models import Category, Post, Comment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class PostSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=True, read_only=True)
    author = serializers.StringRelatedField()
    class Meta:
        model = Post
        fields = [
            'id', 'author', 'title', 'slug', 'excerpt', 'content',
            'published', 'published_date', 'tags', 'category', 'created_at', 'updated_at'
            ]
    

class CommentSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    author = serializers.StringRelatedField()
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'is_approved', 'created_at', 'updated_at']