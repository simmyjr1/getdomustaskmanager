import { redirect } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TZDetector } from "@/components/tz-detector"
import { auth } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, timeZone: true },
  })

  if (!me) redirect("/login")

  return (
    <TooltipProvider>
      <div className="[--header-height:calc(--spacing(14))]">
        <TZDetector currentTimeZone={me.timeZone} />
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar user={me} />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                {children}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  )
}
