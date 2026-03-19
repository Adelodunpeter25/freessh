export function parseVariables(command: string): string[] {
  const regex = /\{([A-Za-z0-9_]+)\}/g
  const matches = command.matchAll(regex)
  const variables = new Set<string>()

  for (const match of matches) {
    if (match[1]) variables.add(match[1])
  }

  return Array.from(variables)
}

export function replaceVariables(command: string, values: Record<string, string>): string {
  let result = command

  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, value)
  }

  return result
}

