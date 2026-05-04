export type AssigneeSummary = {
  id: string
  email: string
  name: string | null
  timeZone: string
}

export type CreatorSummary = {
  id: string
  email: string
  name: string | null
}

export type TaskWithRelations = {
  id: string
  title: string
  description: string | null
  completed: boolean
  dueDate: string | null
  createdById: string
  createdBy: CreatorSummary
  assignees: AssigneeSummary[]
  createdAt: string
  updatedAt: string
}

export type UserSummary = {
  id: string
  email: string
  name: string | null
  timeZone: string
}
