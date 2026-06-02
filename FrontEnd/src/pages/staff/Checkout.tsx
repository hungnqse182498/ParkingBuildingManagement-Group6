import ProtectedRoute from '../../components/ProtectedRoute'

export default function StaffCheckout() {
  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Xử lý xe ra bãi</h2>
      </section>
    </ProtectedRoute>
  )
}
