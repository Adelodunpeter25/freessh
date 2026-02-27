import { backendService } from './backend'
import { Snippet, CreateSnippetRequest, UpdateSnippetRequest } from '@/types/snippet'

export const snippetService = {
  async list(): Promise<Snippet[]> {
    const data = await backendService.request<{ snippets?: Snippet[] }>(
      {
        type: 'snippet:list',
        data: {}
      },
      'snippet:list',
      10000,
    )

    return data.snippets || []
  },

  async create(request: CreateSnippetRequest): Promise<Snippet> {
    const data = await backendService.request<{ snippet: Snippet }>(
      {
        type: 'snippet:create',
        data: request
      },
      'snippet:create',
      10000,
    )

    return data.snippet
  },

  async update(request: UpdateSnippetRequest): Promise<Snippet> {
    const data = await backendService.request<{ snippet: Snippet }>(
      {
        type: 'snippet:update',
        data: request
      },
      'snippet:update',
      10000,
    )

    return data.snippet
  },

  async delete(id: string): Promise<void> {
    await backendService.request<void>(
      {
        type: 'snippet:delete',
        data: { id }
      },
      'snippet:delete',
      10000,
    )
  }
}
