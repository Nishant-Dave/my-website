from django.shortcuts import render
from myportfolio import settings
from portfolio.forms import ContactForm
from .models import Project, Skill
from django.core.mail import send_mail


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
            # recipient_list = [settings.EMAIL_HOST_USER]
            send_mail(
                subject=f"New contact form submission from: {name}",
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[settings.EMAIL_HOST_USER],
                fail_silently=False,
            )
            

            # print(f"New message from {name} ({email}): {message}")  # For demonstration purposes only
            
            form = ContactForm()  # Reset the form after successful submission
            return render(request, 'portfolio/contact.html', {
                'form': form,
                'success': True
            })
    else:
        form = ContactForm()
    return render(request, 'portfolio/contact.html', {'form': form})

