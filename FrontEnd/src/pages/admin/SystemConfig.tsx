import AdminPageShell from '../../components/AdminPageShell'

export default function AdminSystemConfig() {
  return (
    <AdminPageShell activeItem="system">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý cấu hình hệ thống</h2>
          <p className="section-desc">
            Thiết lập thông số vận hành, tích hợp thanh toán, thông báo và sao lưu dữ liệu.
          </p>

          <form className="config-form card-panel" onSubmit={(e) => e.preventDefault()}>
            <fieldset className="config-fieldset">
              <legend>Thông tin bãi</legend>
              <div className="form-field">
                <label htmlFor="site-name">Tên hệ thống</label>
                <input id="site-name" type="text" defaultValue="EasyParking" />
              </div>
              <div className="form-field">
                <label htmlFor="timezone">Múi giờ</label>
                <select id="timezone" defaultValue="asia-hcm">
                  <option value="asia-hcm">Asia/Ho_Chi_Minh (UTC+7)</option>
                </select>
              </div>
            </fieldset>

            <fieldset className="config-fieldset">
              <legend>Thanh toán & thông báo</legend>
              <div className="form-field checkbox-row">
                <input id="enable-momo" type="checkbox" defaultChecked />
                <label htmlFor="enable-momo">Bật thanh toán MoMo</label>
              </div>
              <div className="form-field checkbox-row">
                <input id="enable-email" type="checkbox" defaultChecked />
                <label htmlFor="enable-email">Gửi email xác nhận đặt chỗ</label>
              </div>
              <div className="form-field checkbox-row">
                <input id="enable-sms" type="checkbox" />
                <label htmlFor="enable-sms">Gửi SMS nhắc hết giờ</label>
              </div>
            </fieldset>

            <fieldset className="config-fieldset">
              <legend>Bảo mật & sao lưu</legend>
              <div className="form-field">
                <label htmlFor="session-timeout">Thời gian phiên (phút)</label>
                <input id="session-timeout" type="number" min={15} defaultValue={60} />
              </div>
              <div className="form-field">
                <label htmlFor="backup-schedule">Lịch sao lưu tự động</label>
                <select id="backup-schedule" defaultValue="daily">
                  <option value="daily">Hàng ngày — 02:00</option>
                  <option value="weekly">Hàng tuần — Chủ nhật</option>
                </select>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost">
                Khôi phục mặc định
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu cấu hình
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminPageShell>
  )
}
