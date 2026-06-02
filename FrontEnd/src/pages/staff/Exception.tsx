import ProtectedRoute from '../../components/ProtectedRoute'

export default function StaffException() {
  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Xử lý ngoại lệ</h2>
      </section>
    </ProtectedRoute>
  )
}
