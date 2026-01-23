import { Monitor, Apple, HardDrive, Server } from 'lucide-react'

export type OSType = 'linux' | 'macos' | 'freebsd' | 'windows' | 'unknown'

export const getOSIcon = (osType?: string) => {
  switch (osType) {
    case 'linux':
      return Monitor
    case 'macos':
      return Apple
    case 'freebsd':
      return HardDrive
    case 'windows':
      return Monitor
    default:
      return Server
  }
}
