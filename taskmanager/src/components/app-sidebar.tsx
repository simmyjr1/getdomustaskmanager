"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckSquareIcon, UsersIcon } from "lucide-react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type Props = React.ComponentProps<typeof Sidebar> & {
  user: {
    id: string
    email: string
    name: string | null
    timeZone: string
  }
}

const NAV_ITEMS = [
  {
    title: "Tasks",
    href: "/dashboard",
    icon: CheckSquareIcon,
    matches: (path: string) => path === "/dashboard",
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: UsersIcon,
    matches: (path: string) => path.startsWith("/dashboard/team"),
  },
] as const

export function AppSidebar({ user, ...props }: Props) {
  const pathname = usePathname()

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-white">
                  <img
                    src="/Screenshot_2026-05-02_at_23.08.21-removebg-preview.png"
                    alt="Get Domus"
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Get Domus TM</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Task Manager
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const active = item.matches(pathname ?? "")
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={active}
                    className={cn(
                      active &&
                        "bg-orange-500/10 text-orange-700 hover:bg-orange-500/15 hover:text-orange-700 data-[active=true]:bg-orange-500/10 data-[active=true]:text-orange-700",
                    )}
                  >
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
