import { Plus } from 'lucide-react'
import ManagerPageShell from '../../components/ManagerPageShell'

export default function ManagerBuildingInfo() {
  return (
    <ManagerPageShell activeItem="building">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý thông tin tòa nhà gửi xe</h2>
          <p className="section-desc">
            Cập nhật tên tòa nhà, địa chỉ, số tầng hầm, giờ mở cửa và thông tin liên hệ vận hành.
          </p>

          <form className="config-form card-panel" onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="building-name">Tên tòa nhà</label>
                <input id="building-name" type="text" defaultValue="EasyParking Tower" />
              </div>
              <div className="form-field">
                <label htmlFor="building-code">Mã cơ sở</label>
                <input id="building-code" type="text" defaultValue="EP-HCM-01" />
              </div>
              <div className="form-field form-field--full">
                <label htmlFor="address">Địa chỉ</label>
                <input id="address" type="text" defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM" />
              </div>
              <div className="form-field">
                <label htmlFor="floors-count">Số tầng hầm</label>
                <input id="floors-count" type="number" min={1} defaultValue={3} />
              </div>
              <div className="form-field">
                <label htmlFor="total-slots">Tổng số slot</label>
                <input id="total-slots" type="number" min={1} defaultValue={288} />
              </div>
              <div className="form-field">
                <label htmlFor="open-time">Giờ mở cửa</label>
                <input id="open-time" type="time" defaultValue="06:00" />
              </div>
              <div className="form-field">
                <label htmlFor="close-time">Giờ đóng cửa</label>
                <input id="close-time" type="time" defaultValue="23:00" />
              </div>
              <div className="form-field">
                <label htmlFor="hotline">Hotline</label>
                <input id="hotline" type="tel" defaultValue="1900 1234" />
              </div>
              <div className="form-field">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" defaultValue="open">
                  <option value="open">Đang hoạt động</option>
                  <option value="maintenance">Bảo trì một phần</option>
                  <option value="closed">Tạm ngưng</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Lưu thông tin
              </button>
            </div>
          </form>

          <div className="card-panel" style={{ marginTop: '1.5rem' }}>
            <div className="toolbar-row">
              <h3 className="panel-subtitle" style={{ margin: 0 }}>
                Khu vực / cổng
              </h3>
              <button type="button" className="btn btn-outline btn-sm">
                <Plus size={16} aria-hidden />
                Thêm khu vực
              </button>
            </div>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Mã khu</th>
                  <th>Tên</th>
                  <th>Tầng</th>
                  <th>Loại xe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A1</td>
                  <td>Khu ô tô B1</td>
                  <td>B1</td>
                  <td>Ô tô</td>
                </tr>
                <tr>
                  <td>M1</td>
                  <td>Khu xe máy B2</td>
                  <td>B2</td>
                  <td>Xe máy</td>
                </tr>
                <tr>
                  <td>E1</td>
                  <td>Khu xe điện B3</td>
                  <td>B3</td>
                  <td>Xe điện</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ManagerPageShell>
  )
}
