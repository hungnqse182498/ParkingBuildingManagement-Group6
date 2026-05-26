import ManagerPageShell from '../../components/ManagerPageShell'

type SlotStatus = 'empty' | 'occupied' | 'reserved' | 'maintenance' | 'locked'

const STATUS_LABELS: Record<SlotStatus, string> = {
  empty: 'Còn trống',
  occupied: 'Đang sử dụng',
  reserved: 'Đã đặt trước',
  maintenance: 'Bảo trì',
  locked: 'Tạm khóa',
}

const SAMPLE_SLOTS: { id: string; floor: string; status: SlotStatus }[] = [
  { id: 'B1-A01', floor: 'B1', status: 'empty' },
  { id: 'B1-A02', floor: 'B1', status: 'occupied' },
  { id: 'B1-A03', floor: 'B1', status: 'reserved' },
  { id: 'B1-A04', floor: 'B1', status: 'maintenance' },
  { id: 'B2-M01', floor: 'B2', status: 'empty' },
  { id: 'B2-M02', floor: 'B2', status: 'locked' },
  { id: 'B2-M03', floor: 'B2', status: 'occupied' },
  { id: 'B3-E01', floor: 'B3', status: 'empty' },
]

const STATUS_COUNTS: Record<SlotStatus, number> = {
  empty: 156,
  occupied: 98,
  reserved: 18,
  maintenance: 10,
  locked: 6,
}

export default function ManagerSlots() {
  return (
    <ManagerPageShell activeItem="slots">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý slot đỗ xe</h2>
          <p className="section-desc">
            Theo dõi trạng thái từng ô: còn trống, đang sử dụng, đã đặt trước, bảo trì hoặc tạm khóa.
          </p>

          <div className="slot-summary-grid">
            {(Object.keys(STATUS_LABELS) as SlotStatus[]).map((status) => (
              <article key={status} className={`slot-summary-card slot-summary--${status}`}>
                <strong>{STATUS_COUNTS[status]}</strong>
                <span>{STATUS_LABELS[status]}</span>
              </article>
            ))}
          </div>

          <div className="toolbar-row card-panel">
            <div className="form-field" style={{ margin: 0, flex: 1, maxWidth: 200 }}>
              <label htmlFor="filter-floor">Lọc tầng</label>
              <select id="filter-floor" defaultValue="all">
                <option value="all">Tất cả</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="B3">B3</option>
              </select>
            </div>
            <div className="form-field" style={{ margin: 0, flex: 1, maxWidth: 220 }}>
              <label htmlFor="filter-status">Trạng thái</label>
              <select id="filter-status" defaultValue="all">
                <option value="all">Tất cả</option>
                {(Object.keys(STATUS_LABELS) as SlotStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
              Thêm slot
            </button>
          </div>

          <div className="slot-visual-grid">
            {SAMPLE_SLOTS.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className={`slot-tile slot-tile--${slot.status}`}
                title={STATUS_LABELS[slot.status]}
              >
                <span className="slot-tile-id">{slot.id}</span>
                <span className="slot-tile-status">{STATUS_LABELS[slot.status]}</span>
              </button>
            ))}
          </div>

          <div className="card-panel table-wrap" style={{ marginTop: '1.5rem' }}>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Mã slot</th>
                  <th>Tầng</th>
                  <th>Trạng thái</th>
                  <th>Biển số / đặt chỗ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>B1-A02</td>
                  <td>B1</td>
                  <td>
                    <span className="slot-badge slot-badge--occupied">Đang sử dụng</span>
                  </td>
                  <td>51A-12345</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm">
                      Chi tiết
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>B1-A03</td>
                  <td>B1</td>
                  <td>
                    <span className="slot-badge slot-badge--reserved">Đã đặt trước</span>
                  </td>
                  <td>Đặt trước #1024</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm">
                      Chi tiết
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>B2-M02</td>
                  <td>B2</td>
                  <td>
                    <span className="slot-badge slot-badge--locked">Tạm khóa</span>
                  </td>
                  <td>—</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm">
                      Mở khóa
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ManagerPageShell>
  )
}
