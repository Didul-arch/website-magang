"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Users, FileText, Settings, Database, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase/config"
import { useAuth } from "@/lib/firebase/auth-provider"
import { checkIsAdmin } from "@/lib/firebase/admin-utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsCheckingAdmin(false)
        return
      }

      try {
        const adminStatus = await checkIsAdmin(user)
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setIsCheckingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  useEffect(() => {
    if (!loading && !isCheckingAdmin) {
      if (!user) {
        router.push("/login")
      } else if (!isAdmin) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, isAdmin, isCheckingAdmin, router])

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading || isCheckingAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden md:flex">
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/admin">
                  <Users className="h-5 w-5" />
                  <span>Peserta</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/admin/questions">
                  <FileText className="h-5 w-5" />
                  <span>Soal Tes</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/admin/export">
                  <Database className="h-5 w-5" />
                  <span>Export Data</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/admin/settings">
                  <Settings className="h-5 w-5" />
                  <span>Pengaturan</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </Sidebar>
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  )
}
