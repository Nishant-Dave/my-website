from django.shortcuts import render
from .models import Project, Skill

def portfolio_home(request):
    projects = Project.objects.all()
    skills = Skill.objects.all()
    return render(request, 'portfolio/home.html', {'projects': projects, 'skills': skills})

def project_detail(request, slug):
    project = Project.objects.get(slug=slug)
    return render(request, 'portfolio/project_detail.html', {'project': project})

