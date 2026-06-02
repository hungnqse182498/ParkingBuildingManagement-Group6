import ProtectedRoute from '../../components/ProtectedRoute'
import { useAuth } from '../../context/AuthContext'

export default function UserProfile() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Tài khoản</h2>
        <p>Email: {user?.email}</p>
        <p>Tên: {user?.name}</p>
        <p>Vai trò: {user?.role}</p>
      </section>
    </ProtectedRoute>
  )
}
