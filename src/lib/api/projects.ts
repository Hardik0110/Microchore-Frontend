import type { Project, ProjectTaskInput, Task } from '../../types'
import { apiFetch } from './client'

export async function apiGetProjects(): Promise<Project[]> {
  const data = await apiFetch<Project[] | { results: Project[] }>('/api/projects/')
  if (Array.isArray(data)) return data
  return data.results ?? []
}

export async function apiCreateProject(
  input: Pick<Project, 'companyName' | 'name' | 'description' | 'targetUrl' | 'payRate'>,
): Promise<Project> {
  return apiFetch<Project>('/api/projects/', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function apiUpdateProjectStatus(
  id: string,
  status: Project['status'],
): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function apiCreateProjectTask(
  projectId: string,
  input: ProjectTaskInput,
): Promise<Task> {
  const t = await apiFetch<Task>(`/api/projects/${projectId}/tasks/`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return { ...t, id: String(t.id) }
}
