export interface Snippet {
  id: string
  name: string
  command: string
  description?: string
  tags?: string[]
  created_at: string
}

export interface CreateSnippetRequest {
  name: string
  command: string
  description?: string
  tags?: string[]
}

export interface UpdateSnippetRequest {
  id: string
  name: string
  command: string
  description?: string
  tags?: string[]
}
