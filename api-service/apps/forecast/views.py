from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.models import Invoice, Expense
import pandas as pd
from prophet import Prophet
from django.db.models import Sum
from django.db.models.functions import TruncDate

class ForecastView(APIView):
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        user = request.user

        # 1. Fetch Income (Invoices)
        invoices = Invoice.objects.filter(user=user).annotate(
            date=TruncDate('issueDate')
        ).values('date').annotate(amount=Sum('total')).order_by('date')

        # 2. Fetch Outflow (Expenses)
        expenses = Expense.objects.filter(user=user).annotate(
            date=TruncDate('expenseDate')
        ).values('date').annotate(amount=Sum('amount')).order_by('date')

        # 3. Process Data with Pandas
        df_income = pd.DataFrame(list(invoices))
        df_expense = pd.DataFrame(list(expenses))

        if df_income.empty and df_expense.empty:
            return Response({
                "message": "No data available for forecasting",
                "predictions": []
            }, status=status.HTTP_200_OK)

        # Merge and calculate net flow
        all_dates = pd.concat([df_income['date'], df_expense['date']]).unique()
        df = pd.DataFrame({'ds': all_dates})
        df['ds'] = pd.to_datetime(df['ds'])
        
        income_map = df_income.set_index('date')['amount'].to_dict() if not df_income.empty else {}
        expense_map = df_expense.set_index('date')['amount'].to_dict() if not df_expense.empty else {}
        
        df['income'] = df['ds'].dt.date.map(income_map).fillna(0).astype(float)
        df['expense'] = df['ds'].dt.date.map(expense_map).fillna(0).astype(float)
        df['y'] = df['income'] - df['expense']

        # 4. Prophet ML Logic
        if len(df) < 2:
            return Response({
                "message": "Insufficient data points for ML forecast",
                "predictions": []
            }, status=status.HTTP_200_OK)

        model = Prophet(yearly_seasonality=True, daily_seasonality=False)
        model.fit(df[['ds', 'y']])

        future = model.make_future_dataframe(periods=days)
        forecast = model.predict(future)

        # 5. Format Response
        predictions = forecast.tail(days)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict('records')
        
        return Response({
            "summary": {
                "trend": "upward" if forecast.iloc[-1]['yhat'] > forecast.iloc[-days]['yhat'] else "downward",
                "days_forecasted": days
            },
            "predictions": [
                {
                    "date": p['ds'].strftime('%Y-%m-%d'),
                    "predicted_net_flow": round(p['yhat'], 2),
                    "lower_bound": round(p['yhat_lower'], 2),
                    "upper_bound": round(p['yhat_upper'], 2)
                } for p in predictions
            ]
        }, status=status.HTTP_200_OK)
