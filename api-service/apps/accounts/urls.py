from django.urls import path
from .views import SendInvoiceEmailView

urlpatterns = [
    path('invoices/<str:invoice_id>/send/', SendInvoiceEmailView.as_view(), name='send-invoice-email'),
]
