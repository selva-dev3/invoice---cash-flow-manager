import os
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Invoice, UserSettings

class SendInvoiceEmailView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, invoice_id):
        try:
            print(f"DEBUG: Attempting to send email for invoice {invoice_id}")
            invoice = Invoice.objects.select_related('client', 'user').get(id=invoice_id)
            
            # Use getattr to safely access settings
            user_settings = getattr(invoice.user, 'settings', None)
            company_name = user_settings.companyName if user_settings else "InvoiceFlow"
            
            # Use Resend API
            api_key = os.getenv('RESEND_API_KEY')
            if not api_key:
                print("DEBUG: RESEND_API_KEY is missing!")
                return Response({"error": "Resend API key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            print(f"DEBUG: Sending to {invoice.client.email} using key starting with {api_key[:5]}...")
            
            # Simple HTML template
            html_content = f"""
                <h1>Invoice {invoice.invoiceNumber}</h1>
                <p>Hello {invoice.client.name},</p>
                <p>{company_name} has sent you a new invoice for {invoice.currency} {invoice.total}.</p>
                <p>Due date: {invoice.dueDate.strftime('%Y-%m-%d')}</p>
                <p>Thank you!</p>
            """

            response = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": "InvoiceFlow <onboarding@resend.dev>",
                    "to": [invoice.client.email],
                    "subject": f"Invoice {invoice.invoiceNumber} from {company_name}",
                    "html": html_content,
                }
            )

            print(f"DEBUG: Resend response status: {response.status_code}")
            if response.status_code == 201 or response.status_code == 200:
                if invoice.status == 'DRAFT':
                    invoice.status = 'SENT'
                    invoice.save()
                return Response({"message": "Email sent successfully"}, status=status.HTTP_200_OK)
            else:
                error_data = response.json()
                print(f"DEBUG: Resend error details: {error_data}")
                return Response({
                    "error": "Failed to send email", 
                    "details": error_data
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Invoice.DoesNotExist:
            print(f"DEBUG: Invoice {invoice_id} not found")
            return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"DEBUG: Exception occurred: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
