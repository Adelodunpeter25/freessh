import { forwardRef, useState, ChangeEvent, InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: number[]
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, defaultValue, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue?.[0] || value?.[0] || 0)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      setInternalValue(newValue)
      onValueChange?([newValue])
    }

    const currentValue = value?.[0] ?? internalValue

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className={cn(
          "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
          "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0",
          className
        )}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
