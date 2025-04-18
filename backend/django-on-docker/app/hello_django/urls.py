from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views

from upload.views import (
    image_upload,
    dashboard,
    upload_match,
    match_detail,
    create_analysis,
    analysis_detail
)

urlpatterns = [
    # Authentication
    path('login/', auth_views.LoginView.as_view(template_name='upload/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='dashboard'), name='logout'),
    
    # Main application URLs
    path('', dashboard, name='dashboard'),
    path('upload/', image_upload, name='upload'),  # Keep for compatibility
    path('match/upload/', upload_match, name='upload_match'),
    path('match/<int:match_id>/', match_detail, name='match_detail'),
    path('match/<int:match_id>/analyze/', create_analysis, name='create_analysis'),
    path('analysis/<int:analysis_id>/', analysis_detail, name='analysis_detail'),
    
    # Admin
    path('admin/', admin.site.urls),
]

if bool(settings.DEBUG):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
