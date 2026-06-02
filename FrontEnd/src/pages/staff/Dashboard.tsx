import ProtectedRoute from '../../components/ProtectedRoute'

export default function StaffDashboard() {
  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Staff Dashboard</h2>
      </section>
    </ProtectedRoute>
  )
}
