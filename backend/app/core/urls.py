from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="FutBall-IQ API",
        default_version='v1',
        description="API for FutBall-IQ football analytics platform",
        terms_of_service="https://www.futballiq.com/terms/",
        contact=openapi.Contact(email="contact@futballiq.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include([
        path('teams/', include('teams.urls')),
        path('players/', include('players.urls')),  # Now enabled
        # path('stats/', include('stats.urls')),      # To be added later
        # path('predictions/', include('predictions.urls')),  # To be added later
    ])),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 