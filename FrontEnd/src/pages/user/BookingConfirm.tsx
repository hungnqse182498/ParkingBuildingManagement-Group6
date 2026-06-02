import ProtectedRoute from '../../components/ProtectedRoute'

export default function UserBookingConfirm() {
  return (
    <ProtectedRoute>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Xác nhận đặt chỗ</h2>
      </section>
    </ProtectedRoute>
  )
}
