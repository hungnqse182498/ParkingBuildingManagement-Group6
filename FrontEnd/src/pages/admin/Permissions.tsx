import AdminPageShell from '../../components/AdminPageShell'

const ROLES = [
  {
    id: 'user',
    name: 'Người dùng',
    permissions: ['Đặt chỗ trước', 'Xem lịch sử', 'Thanh toán online'],
  },
  {
    id: 'staff',
    name: 'Nhân viên',
    permissions: ['Quét biển số', 'Tạo lượt gửi xe', 'Xử lý xe ra', 'Xử lý ngoại lệ'],
  },
  {
    id: 'manager',
    name: 'Quản lý',
    permissions: [
      'Quản lý tòa nhà & slot',
      'Cấu hình bảng giá',
      'Xem báo cáo vận hành',
      'Quản lý nâng cao',
    ],
  },
  {
    id: 'admin',
    name: 'Quản trị',
    permissions: ['Quản lý tài khoản', 'Phân quyền', 'Cấu hình hệ thống'],
  },
]

const MOCK_ASSIGNMENTS = [
  { email: 'staff@easyparking.vn', role: 'staff', updatedAt: '25/05/2026' },
  { email: 'manager@easyparking.vn', role: 'manager', updatedAt: '24/05/2026' },
  { email: 'admin@easyparking.vn', role: 'admin', updatedAt: '20/05/2026' },
]

export default function AdminPermissions() {
  return (
    <AdminPageShell activeItem="permissions">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Phân quyền</h2>
          <p className="section-desc">
            Gán vai trò cho tài khoản và xem ma trận quyền theo từng nhóm người dùng.
          </p>

          <div className="permission-grid">
            {ROLES.map((role) => (
              <article key={role.id} className="card-panel permission-card">
                <h3>{role.name}</h3>
                <ul className="permission-list">
                  {role.permissions.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <button type="button" className="btn btn-outline btn-sm">
                  Chỉnh sửa quyền
                </button>
              </article>
            ))}
          </div>

          <div className="card-panel table-wrap" style={{ marginTop: '1.5rem' }}>
            <h3 className="panel-subtitle">Gán vai trò gần đây</h3>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ASSIGNMENTS.map((a) => (
                  <tr key={a.email}>
                    <td>{a.email}</td>
                    <td>
                      <select className="form-select-inline" defaultValue={a.role} aria-label={`Vai trò ${a.email}`}>
                        <option value="user">Người dùng</option>
                        <option value="staff">Nhân viên</option>
                        <option value="manager">Quản lý</option>
                        <option value="admin">Quản trị</option>
                      </select>
                    </td>
                    <td>{a.updatedAt}</td>
                    <td>
                      <button type="button" className="btn btn-primary btn-sm">
                        Lưu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
