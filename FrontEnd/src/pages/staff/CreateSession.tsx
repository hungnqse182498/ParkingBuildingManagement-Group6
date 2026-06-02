import ProtectedRoute from '../../components/ProtectedRoute'

export default function StaffCreateSession() {
  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Tạo lượt gửi xe</h2>
      </section>
    </ProtectedRoute>
  )
}
