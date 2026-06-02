import ProtectedRoute from '../../components/ProtectedRoute'

export default function UserBookingSuccess() {
  return (
    <ProtectedRoute>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Đặt chỗ thành công</h2>
      </section>
    </ProtectedRoute>
  )
}
