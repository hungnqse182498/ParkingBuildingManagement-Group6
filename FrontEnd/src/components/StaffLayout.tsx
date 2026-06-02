import { useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface SidebarItem {
  id: string
  label: string
  icon?: ReactNode
}

interface StaffLayoutProps {
  children: ReactNode
  items: SidebarItem[]
  activeItem: string
  onSelectItem: (id: string) => void
}

export default function StaffLayout({ children, items, activeItem, onSelectItem }: StaffLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="staff-layout">
      <aside className={`staff-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button type="button" className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sidebar-menu-item ${activeItem === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectItem(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  {item.icon && <span className="sidebar-menu-icon">{item.icon}</span>}
                  <span className="sidebar-menu-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="staff-main">
        <main className="staff-content">{children}</main>
      </div>
      {sidebarOpen && <div className="staff-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
    </div>
  )
}
