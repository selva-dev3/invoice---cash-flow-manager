"use client"

import { useState, useEffect } from "react"
import { Client } from "@/types"

export function useClients() {
  const [data, setData] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/v1/clients")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return { data, isLoading, refresh: fetchClients }
}
