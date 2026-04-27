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

from django.db.models import Sum
from apps.accounts.models import Invoice, Expense
from django.utils import timezone
from datetime import datetime

class ReportView(APIView):
    permission_classes = [AllowAny] # In production, use IsAuthenticated
    
    def get(self, request):
        user_id = request.query_params.get('userId')
        if not user_id:
            return HttpResponse(status=400, content="userId query parameter is required")
            
        year = request.query_params.get('year', timezone.now().year)
        
        try:
            # Aggregate Invoices
            invoices = Invoice.objects.filter(user_id=user_id, issueDate__year=year)
            total_income = invoices.filter(status='PAID').aggregate(Sum('total'))['total__sum'] or 0
            tax_collected = invoices.filter(status='PAID').aggregate(Sum('taxAmount'))['taxAmount__sum'] or 0
            
            # Aggregate Expenses
            expenses = Expense.objects.filter(user_id=user_id, expenseDate__year=year)
            total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
            
            # Category breakdown for expenses
            expense_categories = expenses.values('category').annotate(total=Sum('amount')).order_by('-total')
            
            data = {
                "year": year,
                "summary": {
                    "totalIncome": float(total_income),
                    "totalExpenses": float(total_expenses),
                    "netIncome": float(total_income - total_expenses),
                    "taxCollected": float(tax_collected)
                },
                "expenseBreakdown": [
                    {"category": item['category'], "amount": float(item['total'])}
                    for item in expense_categories
                ]
            }
            
            from django.http import JsonResponse
            return JsonResponse(data)
            
        except Exception as e:
            return HttpResponse(status=500, content=f"Error generating report: {str(e)}")
