"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftIcon } from "lucide-react"

const TITLES: Record<string, string> = {
  "/dashboard": "Tasks",
  "/dashboard/team": "Team",
}

function pageTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname]
  for (const [prefix, title] of Object.entries(TITLES)) {
    if (pathname.startsWith(prefix + "/")) return title
  }
  return "Dashboard"
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname() ?? "/dashboard"
  const title = pageTitle(pathname)
  const isRoot = pathname === "/dashboard"

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeftIcon />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {!isRoot && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto sm:hidden">
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
    </header>
  )
}
