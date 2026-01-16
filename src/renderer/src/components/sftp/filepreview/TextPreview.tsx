interface TextPreviewProps {
  content: string
  filename: string
}

export function TextPreview({ content, filename }: TextPreviewProps) {
  const lines = content.split('\n')

  return (
    <div className="h-full overflow-auto font-mono text-sm">
      <div className="flex">
        <div className="select-none text-right pr-4 pl-2 text-muted-foreground/50 border-r border-border bg-muted/30">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 p-2 pl-4 overflow-x-auto">
          {lines.map((line, i) => (
            <div key={i} className="leading-6">{line || ' '}</div>
          ))}
        </pre>
      </div>
    </div>
  )
}
