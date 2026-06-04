import { Settings, Shield, Users } from 'lucide-react'
import type { ReactNode } from 'react'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: ReactNode
  desc?: string
}

export const ADMIN_NAV: NavItem[] = [
  {
    id: 'users',
    label: 'Quản lý tài khoản',
    path: '/admin/users',
    icon: <Users size={18} />,
    desc: 'Thêm, sửa, khóa tài khoản người dùng',
  },
  {
    id: 'permissions',
    label: 'Phân quyền',
    path: '/admin/permissions',
    icon: <Shield size={18} />,
    desc: 'Gán vai trò và quyền truy cập',
  },
  {
    id: 'system',
    label: 'Cấu hình hệ thống',
    path: '/admin/system-config',
    icon: <Settings size={18} />,
    desc: 'Thông số vận hành và tích hợp',
  },
]

export function navigateAdminNav(id: string, navigate: (path: string) => void) {
  const item = ADMIN_NAV.find((n) => n.id === id)
  if (item) navigate(item.path)
}
