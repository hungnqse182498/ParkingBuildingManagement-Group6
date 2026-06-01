import ManagerPageShell from '../../components/ManagerPageShell'

const CASES = [
  { id: 'EX-001', type: 'Mất vé', plate: '51F-99999', time: '25/05 14:20', status: 'pending' },
  { id: 'EX-002', type: 'Sai biển số', plate: '30A-11111', time: '25/05 11:05', status: 'resolved' },
  { id: 'EX-003', type: 'Quá giờ đặt trước', plate: '51B-22222', time: '24/05 19:40', status: 'pending' },
  { id: 'EX-004', type: 'Gửi sai khu vực', plate: '59C-33333', time: '24/05 08:15', status: 'pending' },
  { id: 'EX-005', type: 'Chưa thanh toán', plate: '51D-44444', time: '23/05 22:10', status: 'resolved' },
]

const typeLabels: Record<string, string> = {
  'Mất vé': 'badge-cancelled',
  'Sai biển số': 'badge-paid',
  'Quá giờ đặt trước': 'badge-paid',
  'Gửi sai khu vực': 'badge-cancelled',
  'Chưa thanh toán': 'badge-cancelled',
}

export default function ManagerAdvanced() {
  return (
    <ManagerPageShell activeItem="advanced">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý nâng cao</h2>
          <p className="section-desc">
            Theo dõi các trường hợp đặc biệt: mất vé, sai biển số, quá giờ, gửi sai khu vực, xe chưa thanh toán.
          </p>

          <div className="slot-summary-grid">
            <article className="slot-summary-card slot-summary--reserved">
              <strong>3</strong>
              <span>Đang xử lý</span>
            </article>
            <article className="slot-summary-card slot-summary--empty">
              <strong>2</strong>
              <span>Đã xử lý hôm nay</span>
            </article>
            <article className="slot-summary-card slot-summary--maintenance">
              <strong>1</strong>
              <span>Mất vé (tháng)</span>
            </article>
          </div>

          <div className="card-panel table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Mã sự vụ</th>
                  <th>Loại</th>
                  <th>Biển số</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {CASES.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      <span className={`badge ${typeLabels[c.type] ?? ''}`}>{c.type}</span>
                    </td>
                    <td>{c.plate}</td>
                    <td>{c.time}</td>
                    <td>
                      {c.status === 'pending' ? (
                        <span className="badge badge-cancelled">Chờ xử lý</span>
                      ) : (
                        <span className="badge badge-paid">Đã xử lý</span>
                      )}
                    </td>
                    <td>
                      <button type="button" className="btn btn-primary btn-sm">
                        Xử lý
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ManagerPageShell>
  )
}
