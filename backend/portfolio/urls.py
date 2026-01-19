from django.urls import path
from . import views
from . views import CategoryListView, PostListView, PostDetailView, CommentListView, CommentCreateView

urlpatterns = [
    path('api/', views.portfolio_home, name='portfolio_home'),
    path('project/<slug:slug>/', views.project_detail, name='project_detail'),
    path('contact/', views.contact, name='contact'),

    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('posts/', PostListView.as_view(), name='post-list'),
    path('posts/<slug:slug>/', PostDetailView.as_view(), name='post-detail'),
    path('comments/', CommentListView.as_view(), name='comment-list'),
    path('comments/create/', CommentCreateView.as_view(), name='comment-create'),

]