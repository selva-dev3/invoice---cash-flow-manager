from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ReportView(APIView):
    def get(self, request):
        return Response({
            "message": "Tax summary report endpoint",
            "report_url": "https://example.com/report.pdf"
        }, status=status.HTTP_200_OK)
