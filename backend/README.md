________________________________________
📌 Project Summary for Main Chat (Portfolio Website with Django)
Context
•	I want to build a full-stack personal portfolio + blog website.
•	Frontend UI (templates + TailwindCSS) is ready.
•	I’ll build the backend from scratch using Django to learn properly.
________________________________________
🛠 Tech Stack
•	Backend: Django (latest stable)
•	Database: SQLite (local) → switchable to PostgreSQL (production)
•	Frontend: Django Templates + TailwindCSS
•	Forms: Django forms with validation + CSRF protection
•	Auth: Django built-in authentication (admin/blog author)
•	Deployment ready: requirements.txt, manage.py, settings.py with DEBUG toggle, static/media handling
________________________________________
✨ Features
Portfolio
•	About Me page (skills, background, journey)
•	Resume Download (serve PDF)
•	Projects Showcase (title, desc, screenshots, GitHub link, demo link, tag filtering)
•	Skills Section (tech + soft skills, list or chart)
•	Contact Page (form → SMTP email, social links, email address)
Blog
•	Blog home (posts list + pagination)
•	Single post page (Markdown + optional WYSIWYG)
•	Categories & Tags
•	Comments (moderated via admin)
•	Likes/Reactions
•	Search (title, content, tags)
Global
•	Navbar (Portfolio, Blog, Contact, Resume)
•	Footer (social links)
•	Responsive (mobile, tablet, desktop)
•	Dark/Light mode toggle (persist via cookies/localStorage)
•	SEO-friendly structure (meta tags)
________________________________________
📂 Project Structure
myportfolio/
├─ manage.py
├─ requirements.txt
├─ myportfolio/ (settings, urls, wsgi, asgi)
├─ apps/
│  ├─ core/ (base templates, homepage, context processors)
│  ├─ portfolio/ (about, resume, projects, skills, contact)
│  └─ blog/ (posts, categories, tags, comments, likes, search)
├─ static/ (CSS, JS, images)
├─ media/ (uploads, resume PDF)
└─ templates/ (base.html + app templates)
________________________________________
🔑 Implementation Plan (Phases)
Phase 0 — Setup
•	Virtualenv, install Django + Pillow + Markdown + CKEditor + Taggit + psycopg2-binary + whitenoise
•	Create project + apps
•	Setup requirements.txt
Phase 1 — Settings
•	settings.py: debug toggle via .env, static/media config, whitenoise, email backend, PostgreSQL via DATABASE_URL for production.
Phase 2 — Core app
•	Base templates (base.html) with navbar/footer/dark-light toggle.
•	Context processor for global data (skills, nav items).
Phase 3 — Portfolio app
•	Models: Project, ProjectImage, Skill
•	Views: ListView for projects, DetailView, contact form view, resume download view
•	Forms: ContactForm (with validation, CSRF)
•	Admin: Manage projects, tags, skills
Phase 4 — Blog app
•	Models: Post, Category, Comment, Like (with User/IP), Tags (via taggit)
•	Markdown/WYSIWYG: store markdown + render HTML, or use CKEditor
•	Views: ListView with pagination, DetailView, SearchView, Comment submission
•	Admin: Manage posts (slug auto, categories, tags, publish toggle)
Phase 5 — Global Features
•	Navbar + footer includes
•	Responsive Tailwind styling
•	SEO (meta tags, titles, descriptions)
Phase 6 — Testing
•	Unit tests for models (str methods, save methods)
•	View tests (status codes, templates, content)
Phase 7 — Deployment Prep
•	Collect static with whitenoise
•	Postgres config via dj-database-url
•	Gunicorn for production
•	DEBUG toggle via env
•	Secure cookies + CSRF in production
________________________________________
🔍 Advice on What to Do First
•	Step 1: Do a lightweight plan on paper → draw ERD (Entity-Relationship Diagram) for models:
o	Portfolio: Project ↔ ProjectImage, Skill
o	Blog: Post ↔ Category, Tags, Comment, Like, User
•	Step 2: Bootstrap Django project + apps
•	Step 3: Implement models from your ERD, run makemigrations + migrate
•	Step 4: Build features iteratively (admin → portfolio → blog → contact → global → tests → deploy)
________________________________________
“Here’s my project plan for a Django portfolio/blog website. Let’s start building step by step.”
________________________________________
________________________________________
📊 Database Schema (ERD) — Django Portfolio + Blog
User
•	Comes from Django’s built-in auth_user table.
•	Used for blog post authors (admin/you).
________________________________________
Portfolio App
Project
Field	Type	Notes
id (PK)	AutoField	primary key
title	CharField(255)	project title
slug	SlugField(unique)	URL slug
short_description	TextField	summary/teaser
body	TextField(blank=True)	detailed case study (Markdown or HTML)
github_url	URLField(null=True, blank=True)	optional
demo_url	URLField(null=True, blank=True)	optional
created	DateTimeField(auto_now_add=True)	timestamp
updated	DateTimeField(auto_now=True)	timestamp
🔗 Relations:
•	Tags (many-to-many via django-taggit)
•	ProjectImage (one-to-many)
________________________________________
ProjectImage
Field	Type	Notes
id (PK)	AutoField	primary key
project	FK → Project	each image belongs to a project
image	ImageField(upload_to="projects/")	stored in media/projects/
caption	CharField(255, blank=True)	optional
________________________________________
Skill
Field	Type	Notes
id (PK)	AutoField	primary key
name	CharField(80)	skill name
proficiency	IntegerField(0–100)	% proficiency
order	SmallIntegerField	for custom sorting
________________________________________
Blog App
Category
Field	Type	Notes
id (PK)	AutoField	primary key
name	CharField(100)	category name
slug	SlugField(unique)	URL-friendly
________________________________________
Post
Field	Type	Notes
id (PK)	AutoField	primary key
author	FK → User	blog author
title	CharField(255)	post title
slug	SlugField(unique)	URL slug
excerpt	TextField(blank=True)	summary
content	TextField	Markdown or HTML
content_html	TextField(blank=True)	cached HTML (optional)
published	BooleanField(default=False)	draft/published
publish_date	DateTimeField(null=True, blank=True)	when published
created	DateTimeField(auto_now_add=True)	timestamp
updated	DateTimeField(auto_now=True)	timestamp
🔗 Relations:
•	Categories (many-to-many)
•	Tags (many-to-many via django-taggit)
•	Comments (one-to-many)
•	Likes (one-to-many)
________________________________________
Comment
Field	Type	Notes
id (PK)	AutoField	primary key
post	FK → Post	comment belongs to a post
name	CharField(100)	commenter name
email	EmailField	commenter email
body	TextField	comment text
created	DateTimeField(auto_now_add=True)	timestamp
is_approved	BooleanField(default=False)	for moderation
________________________________________
PostLike
Field	Type	Notes
id (PK)	AutoField	primary key
post	FK → Post	like belongs to a post
user	FK → User (nullable)	if logged-in user liked
ip_address	GenericIPAddressField(null=True, blank=True)	fallback for anonymous
created	DateTimeField(auto_now_add=True)	timestamp
⚠️ Unique constraint: (post, user) OR (post, ip_address) to prevent multiple likes.
________________________________________
Core App
Handles shared features:
•	Global navigation items (via context processor).
•	Dark/Light mode toggle (client-side, no DB needed).
•	Static pages like homepage, about page can be simple templates.
________________________________________
🔗 Relationships Summary
•	User → Post (1-to-many)
•	Post → Category (many-to-many)
•	Post → Tag (many-to-many via taggit)
•	Post → Comment (1-to-many)
•	Post → PostLike (1-to-many)
•	Project → ProjectImage (1-to-many)
•	Project → Tag (many-to-many via taggit)
________________________________________
✅ This schema is flexible enough for local SQLite and production PostgreSQL.

