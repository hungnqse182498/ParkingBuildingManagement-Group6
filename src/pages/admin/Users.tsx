import { Plus, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import AdminPageShell from '../../components/AdminPageShell'
import { apiClient, API_ENDPOINTS } from '../../config/api'

interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  isSuccess: boolean
  result?: T
}

interface AdminUser {
  userId: string
  userName: string
  email: string
  fullName: string
  phoneNumber: string | null
  roleName: string
  status: string
}

interface UserRoleOption {
  roleId?: string
  roleName: string
  description?: string
}

interface UserFormState {
  userName: string
  email: string
  password: string
  fullName: string
  phoneNumber: string
  roleName: string
}

type ModalMode = 'create' | 'edit'

const EMPTY_FORM: UserFormState = {
  userName: '',
  email: '',
  password: '',
  fullName: '',
  phoneNumber: '',
  roleName: '',
}

const roleLabels: Record<string, string> = {
  admin: 'Quản trị',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  user: 'Người dùng',
  customer: 'Khách hàng',
}

function roleLabel(roleName: string): string {
  const key = roleName?.toLowerCase() ?? ''
  return roleLabels[key] ?? roleName
}

function isAdminUser(user: AdminUser): boolean {
  return user.roleName?.toLowerCase() === 'admin'
}

function statusLabel(status: string): string {
  const s = status?.toLowerCase() ?? ''
  if (s === 'active') return 'Hoạt động'
  if (s === 'inactive') return 'Đã khóa'
  if (s === 'banned') return 'Bị cấm'
  return status || '—'
}

function statusBadgeClass(status: string): string {
  const s = status?.toLowerCase() ?? ''
  if (s === 'active') return 'badge badge-paid'
  if (s === 'banned') return 'badge badge-cancelled'
  return 'badge badge-cancelled'
}

function parseRolesResult(result: unknown): string[] {
  if (!result) return []
  if (Array.isArray(result) && typeof result[0] === 'string') {
    return result as string[]
  }
  if (Array.isArray(result)) {
    return (result as UserRoleOption[])
      .map((r) => r.roleName)
      .filter(Boolean)
  }
  return []
}

function showError(message: string) {
  console.error(message)
  alert(message)
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('create')
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ApiResponse<AdminUser[]>>(API_ENDPOINTS.USER_GET_ALL)
      if (res.isSuccess && Array.isArray(res.result)) {
        setUsers(res.result)
      } else {
        setUsers([])
        if (!res.isSuccess && res.message) {
          setError(res.message)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách người dùng'
      setError(msg)
      setUsers([])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiResponse<string[] | UserRoleOption[]>>(
        API_ENDPOINTS.USER_GET_ROLES,
      )
      if (res.isSuccess) {
        setRoles(parseRolesResult(res.result))
      }
    } catch (err) {
      console.error('Không thể tải danh sách vai trò:', err)
    }
  }, [])

  useEffect(() => {
    void fetchUsers()
    void fetchRoles()
  }, [fetchUsers, fetchRoles])

  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error])

  const openCreateModal = () => {
    setModalMode('create')
    setCurrentUser(null)
    setForm({
      ...EMPTY_FORM,
      roleName: roles[0] ?? '',
    })
    setModalOpen(true)
  }

  const openEditModal = (user: AdminUser) => {
    setModalMode('edit')
    setCurrentUser(user)
    setForm({
      userName: user.userName ?? '',
      email: user.email ?? '',
      password: '',
      fullName: user.fullName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      roleName: user.roleName ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setCurrentUser(null)
    setForm(EMPTY_FORM)
  }

  const handleFormChange = (field: keyof UserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (modalMode === 'create') {
        const res = await apiClient.post<ApiResponse>(API_ENDPOINTS.USER_CREATE, {
          userName: form.userName.trim(),
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim() || null,
          roleName: form.roleName,
        })
        if (!res.isSuccess) {
          showError(res.message || 'Tạo tài khoản thất bại')
          return
        }
      } else if (currentUser) {
        const res = await apiClient.put<ApiResponse>(API_ENDPOINTS.USER_UPDATE, {
          userId: currentUser.userId,
          userName: form.userName.trim(),
          email: form.email.trim(),
          password: form.password || '',
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim() || null,
          roleName: form.roleName,
        })
        if (!res.isSuccess) {
          showError(res.message || 'Cập nhật tài khoản thất bại')
          return
        }
      }
      closeModal()
      await fetchUsers()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi lưu tài khoản'
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (user: AdminUser) => {
    if (isAdminUser(user)) {
      showError('Không thể thay đổi trạng thái tài khoản admin')
      return
    }
    const nextStatus =
      user.status?.toLowerCase() === 'active' ? 'Inactive' : 'Active'
    try {
      const res = await apiClient.patch<ApiResponse>(
        `${API_ENDPOINTS.USER_STATUS}/${user.userId}/status`,
        { status: nextStatus },
      )
      if (!res.isSuccess) {
        showError(res.message || 'Đổi trạng thái thất bại')
        return
      }
      await fetchUsers()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi đổi trạng thái'
      showError(msg)
    }
  }

  const handleDelete = async (user: AdminUser) => {
    if (isAdminUser(user)) {
      showError('Không thể xóa tài khoản admin')
      return
    }
    const label = user.fullName || user.email
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${label}"?`)) {
      return
    }
    try {
      const res = await apiClient.delete<ApiResponse>(
        `${API_ENDPOINTS.USER_DELETE}/${user.userId}`,
      )
      if (!res.isSuccess) {
        showError(res.message || 'Xóa tài khoản thất bại')
        return
      }
      await fetchUsers()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi xóa tài khoản'
      showError(msg)
    }
  }

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'vi')),
    [users],
  )

  return (
    <AdminPageShell activeItem="users">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý tài khoản người dùng</h2>
          <p className="section-desc">
            Thêm, chỉnh sửa, khóa hoặc mở khóa tài khoản. Theo dõi trạng thái đăng nhập và thông tin liên hệ.
          </p>

          <div className="toolbar-row card-panel">
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {loading ? 'Đang tải...' : `${users.length} tài khoản`}
            </p>
            <button type="button" className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} aria-hidden />
              Thêm tài khoản
            </button>
          </div>

          <div className="card-panel table-wrap">
            {loading ? (
              <p style={{ padding: '1rem', margin: 0, color: 'var(--text-muted)' }}>Đang tải...</p>
            ) : (
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ color: 'var(--text-muted)' }}>
                        Không có tài khoản nào.
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map((u) => {
                      const isActive = u.status?.toLowerCase() === 'active'
                      const admin = isAdminUser(u)
                      return (
                        <tr key={u.userId}>
                          <td>{u.fullName || '—'}</td>
                          <td>{u.email}</td>
                          <td>{u.phoneNumber || '—'}</td>
                          <td>{roleLabel(u.roleName)}</td>
                          <td>
                            <span className={statusBadgeClass(u.status)}>
                              {statusLabel(u.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={admin}
                              onClick={() => openEditModal(u)}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={admin}
                              onClick={() => void handleToggleStatus(u)}
                            >
                              {isActive ? 'Khóa' : 'Mở khóa'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={admin}
                              onClick={() => void handleDelete(u)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="user-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="user-modal card-panel" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div className="user-modal-header">
              <h3 id="user-modal-title">
                {modalMode === 'create' ? 'Thêm tài khoản' : 'Sửa tài khoản'}
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>
            <form className="config-form" onSubmit={(e) => void handleSubmit(e)}>
              <div className="form-grid-2">
                <div className="form-field form-field--full">
                  <label htmlFor="userName">Tên đăng nhập</label>
                  <input
                    id="userName"
                    name="userName"
                    required
                    value={form.userName}
                    onChange={(e) => handleFormChange('userName', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="password">
                    Mật khẩu{modalMode === 'edit' ? ' (để trống nếu không đổi)' : ''}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required={modalMode === 'create'}
                    value={form.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    disabled={submitting}
                    autoComplete={modalMode === 'create' ? 'new-password' : 'off'}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="fullName">Họ tên</label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phoneNumber">Số điện thoại</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="roleName">Vai trò</label>
                  <select
                    id="roleName"
                    name="roleName"
                    required
                    value={form.roleName}
                    onChange={(e) => handleFormChange('roleName', e.target.value)}
                    disabled={submitting}
                  >
                    <option value="" disabled>
                      Chọn vai trò
                    </option>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {roleLabel(r)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={submitting}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .user-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.45);
        }
        .user-modal {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .user-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .user-modal-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--text-heading);
        }
        .user-modal .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .user-modal .form-field label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-heading);
        }
        .user-modal .form-field input,
        .user-modal .form-field select {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.9375rem;
        }
      `}</style>
    </AdminPageShell>
  )
}
