"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { store, type User } from "@/lib/store"

export function UserHeader() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(store.getUser())
    const unsubscribe = store.subscribe(() => {
      setUser(store.getUser())
    })
    return unsubscribe
  }, [])

  if (!user) return null

  const roleLabels = {
    serving: "Serving Personnel",
    "ex-serviceman": "Ex-Serviceman",
    dependent: "Defence Dependent",
    admin: "CERT Admin",
  }

  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
        <Badge variant="outline" className="mt-1 border-primary/50 text-primary">
          {roleLabels[user.role]}
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Security Status</div>
          <div className="text-sm font-medium text-primary">Active & Monitored</div>
        </div>
      </div>
    </div>
  )
}
