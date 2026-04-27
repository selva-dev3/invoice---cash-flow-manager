from django.urls import path
from .views import ReportView, InvoicePDFView

urlpatterns = [
    path('tax-summary/', ReportView.as_view(), name='tax-summary'),
    path('invoice/<str:invoice_id>/', InvoicePDFView.as_view(), name='invoice-pdf'),
]
