import ManagerPageShell from '../../components/ManagerPageShell'

const FLOOR_MAP = [
  { floor: 'B1', zones: ['A1 — Ô tô', 'A2 — SUV'], capacity: 96, vehicleTypes: ['Ô tô', 'SUV'] },
  { floor: 'B2', zones: ['M1 — Xe máy', 'M2 — Xe máy VIP'], capacity: 120, vehicleTypes: ['Xe máy'] },
  { floor: 'B3', zones: ['E1 — Xe điện'], capacity: 72, vehicleTypes: ['Xe điện', 'Ô tô (tạm)'] },
]

export default function ManagerFloorAssignment() {
  return (
    <ManagerPageShell activeItem="floors">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý phân tầng theo loại xe</h2>
          <p className="section-desc">
            Gán tầng hầm và khu vực cho từng loại phương tiện. Hướng dẫn nhân viên đưa xe vào đúng khu.
          </p>

          <div className="floor-assignment-grid">
            {FLOOR_MAP.map((f) => (
              <article key={f.floor} className="card-panel floor-card">
                <header className="floor-card-header">
                  <h3>Tầng {f.floor}</h3>
                  <span className="badge badge-paid">{f.capacity} slot</span>
                </header>
                <p>
                  <strong>Loại xe:</strong> {f.vehicleTypes.join(', ')}
                </p>
                <ul className="permission-list">
                  {f.zones.map((z) => (
                    <li key={z}>{z}</li>
                  ))}
                </ul>
                <button type="button" className="btn btn-outline btn-sm">
                  Chỉnh sửa phân bổ
                </button>
              </article>
            ))}
          </div>

          <div className="card-panel" style={{ marginTop: '1.5rem' }}>
            <h3 className="panel-subtitle">Ma trận phân tầng</h3>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Loại xe</th>
                  <th>Tầng được phép</th>
                  <th>Khu ưu tiên</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Xe máy</td>
                  <td>B2</td>
                  <td>M1, M2</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>Ô tô</td>
                  <td>B1</td>
                  <td>A1</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>SUV</td>
                  <td>B1</td>
                  <td>A2</td>
                  <td>Chỗ rộng hơn 20%</td>
                </tr>
                <tr>
                  <td>Xe điện</td>
                  <td>B3</td>
                  <td>E1</td>
                  <td>Có trạm sạc</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ManagerPageShell>
  )
}
