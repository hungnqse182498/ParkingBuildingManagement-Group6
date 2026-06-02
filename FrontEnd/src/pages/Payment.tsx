import ProtectedRoute from '../components/ProtectedRoute'

export default function Payment() {
  return (
    <ProtectedRoute>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Thanh toán</h2>
        <p>UI thanh toán tạm thời.</p>
      </section>
    </ProtectedRoute>
  )
}
