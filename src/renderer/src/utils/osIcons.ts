import { Server } from 'lucide-react'
import { AppleIcon, UbuntuIcon, DebianIcon, ArchIcon, RedHatIcon, FreeBSDIcon, LinuxIcon, WindowsIcon } from '@/components/icons'

export type OSType = 'ubuntu' | 'debian' | 'arch' | 'redhat' | 'centos' | 'fedora' | 'linux' | 'macos' | 'freebsd' | 'windows' | 'unknown'

export const getOSIcon = (osType?: string) => {
  switch (osType) {
    case 'ubuntu':
      return UbuntuIcon
    case 'debian':
      return DebianIcon
    case 'arch':
      return ArchIcon
    case 'redhat':
    case 'centos':
    case 'fedora':
      return RedHatIcon
    case 'linux':
      return LinuxIcon
    case 'macos':
      return AppleIcon
    case 'freebsd':
      return FreeBSDIcon
    case 'windows':
      return WindowsIcon
    default:
      return Server
  }
}
