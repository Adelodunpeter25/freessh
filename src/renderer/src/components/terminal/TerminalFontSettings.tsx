import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { terminalFonts, fontWeights } from '@/utils/terminalFonts'
import { useTerminalFontStore } from '@/stores/terminalFontStore'

interface TerminalFontSettingsProps {
  onBack: () => void
}

export function TerminalFontSettings({ onBack }: TerminalFontSettingsProps) {
  const { fontFamily, fontSize, fontWeight, setFontFamily, setFontSize, setFontWeight } = useTerminalFontStore()

  const handleFontFamilyChange = (name: string) => {
    const font = terminalFonts.find(f => f.name === name)
    if (font) setFontFamily(font.family)
  }

  const currentFontName = terminalFonts.find(f => f.family === fontFamily)?.name || 'JetBrains Mono'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Font Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-3">
          <Label>Font Family</Label>
          <Select value={currentFontName} onValueChange={handleFontFamilyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {terminalFonts.map((font) => (
                <SelectItem key={font.name} value={font.name}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Font Size</Label>
            <span className="text-sm text-muted-foreground">{fontSize}px</span>
          </div>
          <Slider 
            value={[fontSize]} 
            min={10} 
            max={24} 
            step={1}
            onValueChange={(value) => setFontSize(value[0])}
          />
        </div>

        <div className="space-y-3">
          <Label>Font Weight</Label>
          <Select value={fontWeight.toString()} onValueChange={(v) => setFontWeight(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontWeights.map((weight) => (
                <SelectItem key={weight.value} value={weight.value.toString()}>
                  {weight.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Preview</Label>
          <div 
            className="p-4 rounded-lg bg-black text-white"
            style={{ 
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight
            }}
          >
            <div>$ ssh user@server.com</div>
            <div>Welcome to Ubuntu 22.04 LTS</div>
            <div>Last login: Fri Jan 23 12:00:00 2026</div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">user@server</span>
              <span className="text-blue-400">~</span>
              <span>$</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
