import { Plus } from 'lucide-react'
import ManagerPageShell from '../../components/ManagerPageShell'

const VEHICLE_TYPES = [
  { id: 'moto', name: 'Xe máy', code: 'MOTO', feeGroup: 'Nhóm 1', slots: 120 },
  { id: 'car', name: 'Ô tô', code: 'CAR', feeGroup: 'Nhóm 2', slots: 140 },
  { id: 'suv', name: 'SUV / xe lớn', code: 'SUV', feeGroup: 'Nhóm 3', slots: 20 },
  { id: 'ev', name: 'Xe điện', code: 'EV', feeGroup: 'Nhóm 2 + phụ phí sạc', slots: 8 },
]

export default function ManagerVehicleTypes() {
  return (
    <ManagerPageShell activeItem="vehicles">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý loại phương tiện</h2>
          <p className="section-desc">
            Định nghĩa loại xe, mã phân loại và nhóm tính phí tương ứng.
          </p>

          <div className="toolbar-row card-panel">
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {VEHICLE_TYPES.length} loại phương tiện đang áp dụng
            </p>
            <button type="button" className="btn btn-primary">
              <Plus size={18} aria-hidden />
              Thêm loại xe
            </button>
          </div>

          <div className="card-panel table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Tên loại</th>
                  <th>Mã</th>
                  <th>Nhóm phí</th>
                  <th>Số slot gán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {VEHICLE_TYPES.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>
                      <code>{v.code}</code>
                    </td>
                    <td>{v.feeGroup}</td>
                    <td>{v.slots}</td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm">
                        Sửa
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm">
                        Xóa
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
