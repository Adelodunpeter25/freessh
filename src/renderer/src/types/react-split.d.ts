declare module 'react-split' {
  import { CSSProperties } from 'react'

  interface SplitProps {
    className?: string
    sizes?: number[]
    minSize?: number | number[]
    maxSize?: number | number[]
    gutterSize?: number
    gutterAlign?: 'center' | 'start' | 'end'
    snapOffset?: number
    dragInterval?: number
    direction?: 'horizontal' | 'vertical'
    cursor?: string
    gutterStyle?: (dimension: number, gutterSize: number, index: number) => CSSProperties
    elementStyle?: (dimension: number, size: number, gutterSize: number) => CSSProperties
    onDrag?: (sizes: number[]) => void
    onDragStart?: (sizes: number[]) => void
    onDragEnd?: (sizes: number[]) => void
    children: React.ReactNode
  }

  export default function Split(props: SplitProps): JSX.Element
}
