import axios from 'axios'
import { ForecastData } from '@/types'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export const fastapi = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getForecast = async (days: number): Promise<ForecastData> => {
  const response = await fastapi.get(`/api/forecast?days=${days}`)
  return response.data
}

export const getRevenueReport = async (from: string, to: string): Promise<any> => {
  const response = await fastapi.get(`/api/reports/revenue?from=${from}&to=${to}`)
  return response.data
}

export const getTaxSummary = async (period: string): Promise<Blob> => {
  const response = await fastapi.get(`/api/reports/tax-summary?period=${period}`, {
    responseType: 'blob',
  })
  return response.data
}
