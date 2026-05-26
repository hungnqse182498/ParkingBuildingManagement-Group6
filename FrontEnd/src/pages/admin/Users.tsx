import { Plus, Search } from 'lucide-react'
import AdminPageShell from '../../components/AdminPageShell'

const MOCK_USERS = [
  { id: 1, name: 'Nguyễn Văn A', email: 'user@easyparking.vn', role: 'user', status: 'active' },
  { id: 2, name: 'Parking Staff', email: 'staff@easyparking.vn', role: 'staff', status: 'active' },
  { id: 3, name: 'Quản lý bãi', email: 'manager@easyparking.vn', role: 'manager', status: 'active' },
  { id: 4, name: 'Quản trị viên', email: 'admin@easyparking.vn', role: 'admin', status: 'active' },
  { id: 5, name: 'Trần Thị B', email: 'tranb@gmail.com', role: 'user', status: 'locked' },
]

const roleLabels: Record<string, string> = {
  user: 'Người dùng',
  staff: 'Nhân viên',
  manager: 'Quản lý',
  admin: 'Quản trị',
}

export default function AdminUsers() {
  return (
    <AdminPageShell activeItem="users">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý tài khoản người dùng</h2>
          <p className="section-desc">
            Thêm, chỉnh sửa, khóa hoặc mở khóa tài khoản. Theo dõi trạng thái đăng nhập và thông tin liên hệ.
          </p>

          <div className="toolbar-row card-panel">
            <div className="search-field">
              <Search size={18} aria-hidden />
              <input type="search" placeholder="Tìm theo tên, email..." aria-label="Tìm tài khoản" />
            </div>
            <button type="button" className="btn btn-primary">
              <Plus size={18} aria-hidden />
              Thêm tài khoản
            </button>
          </div>

          <div className="card-panel table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{roleLabels[u.role] ?? u.role}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-paid' : 'badge-cancelled'}`}>
                        {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm">
                        Sửa
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm">
                        {u.status === 'active' ? 'Khóa' : 'Mở khóa'}
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
