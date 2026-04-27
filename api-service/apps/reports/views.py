from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import Invoice, InvoiceItem
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from io import BytesIO

from rest_framework.permissions import AllowAny

class InvoicePDFView(APIView):
    permission_classes = [AllowAny] 
    authentication_classes = [] 

    def get(self, request, invoice_id):
        try:
            invoice = Invoice.objects.get(id=invoice_id)
            items = InvoiceItem.objects.filter(invoice=invoice)
            
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Header
            p.setFont("Helvetica-Bold", 24)
            p.drawString(50, height - 50, "INVOICE")
            
            p.setFont("Helvetica", 12)
            p.drawRightString(width - 50, height - 50, f"Invoice #: {invoice.invoiceNumber}")
            p.drawRightString(width - 50, height - 70, f"Date: {invoice.issueDate.strftime('%Y-%m-%d')}")
            p.drawRightString(width - 50, height - 90, f"Status: {invoice.status}")

            # Bill To
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, height - 120, "Bill To:")
            p.setFont("Helvetica", 12)
            p.drawString(50, height - 140, f"{invoice.client.name}")
            p.drawString(50, height - 160, f"{invoice.client.email}")

            # Table Header
            y = height - 220
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, "Description")
            p.drawString(300, y, "Qty")
            p.drawString(400, y, "Price")
            p.drawString(500, y, "Amount")
            p.line(50, y - 5, width - 50, y - 5)

            # Table Content
            p.setFont("Helvetica", 12)
            y -= 25
            for item in items:
                p.drawString(50, y, item.description[:40])
                p.drawString(300, y, str(item.quantity))
                p.drawString(400, y, f"{item.unitPrice:,.2f}")
                p.drawString(500, y, f"{item.amount:,.2f}")
                y -= 20
                if y < 100:
                    p.showPage()
                    y = height - 50

            # Totals
            y -= 30
            p.line(350, y + 20, width - 50, y + 20)
            p.drawString(400, y, "Subtotal:")
            p.drawRightString(width - 50, y, f"{invoice.subtotal:,.2f}")
            y -= 20
            p.drawString(400, y, f"Tax ({invoice.taxRate}%):")
            p.drawRightString(width - 50, y, f"{invoice.taxAmount:,.2f}")
            y -= 25
            p.setFont("Helvetica-Bold", 14)
            p.drawString(400, y, "TOTAL:")
            p.drawRightString(width - 50, y, f"{invoice.total:,.2f} {invoice.currency}")

            p.showPage()
            p.save()

            pdf = buffer.getvalue()
            buffer.close()
            
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice-{invoice.invoiceNumber}.pdf"'
            response.write(pdf)
            return response

        except Exception as e:
            return HttpResponse(status=500, content=f"Error generating PDF: {str(e)}")

class ReportView(APIView):
    def get(self, request):
        return HttpResponse("Tax summary logic coming soon...")
