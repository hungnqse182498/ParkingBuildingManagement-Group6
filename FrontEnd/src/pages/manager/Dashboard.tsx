import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Car,
  DollarSign,
  Layers,
  ParkingSquare,
} from 'lucide-react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { MANAGER_NAV } from '../../config/managerNav'

const hubIcons: Record<string, React.ReactNode> = {
  building: <Building2 size={32} />,
  vehicles: <Car size={32} />,
  floors: <Layers size={32} />,
  slots: <ParkingSquare size={32} />,
  pricing: <DollarSign size={32} />,
  reports: <BarChart3 size={32} />,
  advanced: <AlertTriangle size={32} />,
}

export default function ManagerDashboard() {
  const navigate = useNavigate()

  return (
    <ProtectedRoute allowedRoles={['manager']}>
      <div className="staff-dashboard-home">
        <header className="dashboard-header">
          <h1>Quản lý bãi gửi xe</h1>
          <p>Cấu hình tòa nhà, slot, bảng giá và theo dõi vận hành.</p>
        </header>
        <div className="dashboard-menu-grid">
          {MANAGER_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className="dashboard-menu-card"
              onClick={() => navigate(item.path)}
            >
              <div className="menu-card-icon">{hubIcons[item.id]}</div>
              <h3>{item.label}</h3>
              <p>{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
