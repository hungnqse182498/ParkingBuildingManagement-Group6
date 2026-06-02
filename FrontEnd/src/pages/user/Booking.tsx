import ProtectedRoute from '../../components/ProtectedRoute'

export default function UserBooking() {
  return (
    <ProtectedRoute>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Đặt chỗ</h2>
      </section>
    </ProtectedRoute>
  )
}
