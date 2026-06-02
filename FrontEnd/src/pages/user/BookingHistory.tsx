import ProtectedRoute from '../../components/ProtectedRoute'

export default function UserBookingHistory() {
  return (
    <ProtectedRoute>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Lịch sử đặt chỗ</h2>
      </section>
    </ProtectedRoute>
  )
}
