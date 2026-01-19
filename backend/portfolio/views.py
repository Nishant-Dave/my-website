from email.message import EmailMessage
from django.shortcuts import render
from myportfolio import settings
from portfolio.forms import ContactForm
from .models import Project, Skill
from django.core.mail import EmailMessage
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import CategorySerializer, PostSerializer, CommentSerializer
from blog.models import Category, Post, Comment
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend


def portfolio_home(request):
    projects = Project.objects.all()
    skills = Skill.objects.all()
    return render(request, 'portfolio/home.html', {'projects': projects, 'skills': skills})

def project_detail(request, slug):
    project = Project.objects.get(slug=slug)
    skill = Skill.objects.all().order_by('order')
    return render(request, 'portfolio/project_detail.html', {
        'project': project,
        'skills': skill
    })

def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            # Process the form data (e.g., send email)
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            message = form.cleaned_data['message']

            email_message = EmailMessage(
                subject = f"New contact form submission from: {name}",
                body = message,
                from_email = settings.EMAIL_HOST_USER,
                to = [settings.EMAIL_HOST_USER],
                reply_to = [email],
            )
            email_message.send(fail_silently=False)
            
            # print(f"New message from {name} ({email}): {message}")  # For demonstration purposes only
            
            form = ContactForm()  # Reset the form after successful submission
            return render(request, 'portfolio/contact.html', {
                'form': form,
                'success': True
            })
    else:
        form = ContactForm()
    return render(request, 'portfolio/contact.html', {'form': form})


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class PostListView(generics.ListCreateAPIView):
    queryset = Post.objects.filter(published=True)
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__name', 'created_at']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']
       

class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.filter(published=True)
    serializer_class = PostSerializer
    lookup_field = 'slug'

class CommentListView(generics.ListAPIView):
    queryset = Comment.objects.filter(is_approved=True)
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CommentCreateView(generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]