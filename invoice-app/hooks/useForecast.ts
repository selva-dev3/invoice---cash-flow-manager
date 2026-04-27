"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

export function useForecast(days: number = 30) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchForecast() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/v1/forecast?days=${days}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        toast.error("Failed to load forecast data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchForecast()
  }, [days])

  return { data, isLoading }
}
