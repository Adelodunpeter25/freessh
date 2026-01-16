interface ImagePreviewProps {
  src: string
  filename: string
}

export function ImagePreview({ src, filename }: ImagePreviewProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-black/20">
      <img 
        src={src} 
        alt={filename} 
        className="max-w-full max-h-full object-contain"
      />
    </div>
  )
}
