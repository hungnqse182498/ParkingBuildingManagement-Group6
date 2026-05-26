import ManagerPageShell from '../../components/ManagerPageShell'

const PRICING_RULES = [
  { type: 'Xe máy', hourly: '5.000đ', daily: '40.000đ', overnight: '60.000đ', note: 'Tối đa 24h/gói ngày' },
  { type: 'Ô tô', hourly: '15.000đ', daily: '120.000đ', overnight: '180.000đ', note: 'Miễn 15 phút đầu' },
  { type: 'SUV', hourly: '20.000đ', daily: '160.000đ', overnight: '240.000đ', note: '+30% so với ô tô' },
  { type: 'Xe điện', hourly: '15.000đ', daily: '120.000đ', overnight: '180.000đ', note: 'Phụ phí sạc theo kWh' },
]

export default function ManagerPricing() {
  return (
    <ManagerPageShell activeItem="pricing">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý bảng giá & chính sách tính phí</h2>
          <p className="section-desc">
            Thiết lập đơn giá theo giờ, ngày, qua đêm và các quy định ưu đãi, phụ thu.
          </p>

          <div className="card-panel table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Loại xe</th>
                  <th>Theo giờ</th>
                  <th>Theo ngày</th>
                  <th>Qua đêm</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_RULES.map((r) => (
                  <tr key={r.type}>
                    <td>{r.type}</td>
                    <td>{r.hourly}</td>
                    <td>{r.daily}</td>
                    <td>{r.overnight}</td>
                    <td>{r.note}</td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm">
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form className="config-form card-panel" style={{ marginTop: '1.5rem' }} onSubmit={(e) => e.preventDefault()}>
            <h3 className="panel-subtitle">Chính sách bổ sung</h3>
            <div className="form-field checkbox-row">
              <input id="free-first-15" type="checkbox" defaultChecked />
              <label htmlFor="free-first-15">Miễn phí 15 phút đầu (ô tô)</label>
            </div>
            <div className="form-field checkbox-row">
              <input id="peak-surcharge" type="checkbox" defaultChecked />
              <label htmlFor="peak-surcharge">Phụ thu 20% khung 17:00–19:00</label>
            </div>
            <div className="form-field checkbox-row">
              <input id="lost-ticket-fee" type="checkbox" defaultChecked />
              <label htmlFor="lost-ticket-fee">Phí mất vé: 200.000đ + phí gửi thực tế</label>
            </div>
            <div className="form-field">
              <label htmlFor="overtime-policy">Chính sách quá giờ đặt trước</label>
              <select id="overtime-policy" defaultValue="hourly">
                <option value="hourly">Tính thêm theo giờ</option>
                <option value="daily">Chuyển sang gói ngày</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Lưu chính sách
              </button>
            </div>
          </form>
        </div>
      </div>
    </ManagerPageShell>
  )
}
