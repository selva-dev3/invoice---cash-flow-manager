"use client"

import { useState, useEffect } from "react"

const MOCK_RATES: Record<string, number> = {
  "USD": 1,
  "EUR": 0.92,
  "GBP": 0.79,
  "INR": 83.12,
  "AED": 3.67,
}

export function useExchangeRate(from: string, to: string = "USD") {
  const [rate, setRate] = useState<number>(1)

  useEffect(() => {
    const fromRate = MOCK_RATES[from] || 1
    const toRate = MOCK_RATES[to] || 1
    setRate(toRate / fromRate)
  }, [from, to])

  const convert = (amount: number) => amount * rate

  return { rate, convert }
}
