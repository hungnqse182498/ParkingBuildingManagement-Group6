import ManagerPageShell from '../../components/ManagerPageShell'
import { formatCurrency } from '../../utils/pricing'

const VEHICLE_REPORTS = [
  { type: 'Xe máy', inOut: 420, revenue: 18_500_000, occupancy: '78%', peak: '07:30–09:00' },
  { type: 'Ô tô', inOut: 186, revenue: 42_300_000, occupancy: '65%', peak: '17:00–19:00' },
  { type: 'SUV', inOut: 24, revenue: 8_200_000, occupancy: '52%', peak: '18:00–20:00' },
  { type: 'Xe điện', inOut: 12, revenue: 2_100_000, occupancy: '45%', peak: '12:00–14:00' },
]

export default function ManagerReports() {
  return (
    <ManagerPageShell activeItem="reports">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Báo cáo vận hành</h2>
          <p className="section-desc">
            Lượt xe vào/ra, doanh thu, tỷ lệ lấp đầy và khung giờ cao điểm theo từng loại phương tiện.
          </p>

          <div className="toolbar-row card-panel">
            <div className="form-field" style={{ margin: 0 }}>
              <label htmlFor="report-from">Từ ngày</label>
              <input id="report-from" type="date" defaultValue="2026-05-01" />
            </div>
            <div className="form-field" style={{ margin: 0 }}>
              <label htmlFor="report-to">Đến ngày</label>
              <input id="report-to" type="date" defaultValue="2026-05-26" />
            </div>
            <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
              Xem báo cáo
            </button>
          </div>

          <div className="dashboard-grid">
            <article className="stat-card card-panel">
              <strong>642</strong>
              <span>Tổng lượt vào/ra</span>
            </article>
            <article className="stat-card card-panel">
              <strong>{formatCurrency(71_100_000)}</strong>
              <span>Doanh thu kỳ</span>
            </article>
            <article className="stat-card card-panel">
              <strong>68%</strong>
              <span>Tỷ lệ lấp đầy TB</span>
            </article>
            <article className="stat-card card-panel">
              <strong>17:00–19:00</strong>
              <span>Giờ cao điểm chung</span>
            </article>
          </div>

          <div className="card-panel table-wrap" style={{ marginTop: '1.5rem' }}>
            <h3 className="panel-subtitle">Theo loại phương tiện</h3>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Loại xe</th>
                  <th>Lượt vào/ra</th>
                  <th>Doanh thu</th>
                  <th>Lấp đầy</th>
                  <th>Giờ cao điểm</th>
                </tr>
              </thead>
              <tbody>
                {VEHICLE_REPORTS.map((r) => (
                  <tr key={r.type}>
                    <td>{r.type}</td>
                    <td>{r.inOut}</td>
                    <td>{formatCurrency(r.revenue)}</td>
                    <td>{r.occupancy}</td>
                    <td>{r.peak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-chart-placeholder card-panel">
            <p>Biểu đồ lượt xe theo giờ (UI demo)</p>
            <div className="chart-bars" aria-hidden>
              {[40, 65, 90, 55, 70, 95, 80, 60, 45, 50, 75, 85].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ManagerPageShell>
  )
}
