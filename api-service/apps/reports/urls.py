from django.urls import path
from .views import ReportView

urlpatterns = [
    path('tax-summary/', ReportView.as_view(), name='tax-summary'),
]
