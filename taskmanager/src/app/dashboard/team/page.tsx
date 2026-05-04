import { redirect } from "next/navigation"
import { TeamList } from "@/components/team-list"
import { auth } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import type { UserSummary } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function TeamPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, timeZone: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  })

  const list: UserSummary[] = users

  return <TeamList users={list} currentUserId={session.userId} />
}
