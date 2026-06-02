import ProtectedRoute from '../../components/ProtectedRoute'

export default function StaffScanPlate() {
  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <section className="card-panel" style={{ margin: '1rem' }}>
        <h2>Quét biển số</h2>
      </section>
    </ProtectedRoute>
  )
}
