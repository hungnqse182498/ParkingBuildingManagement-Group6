import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import ManagerPageShell from '../../components/ManagerPageShell'
import { apiClient } from '../../config/api'

interface VehicleType {
  vehicleTypeId: number
  vehicleTypeName: string
  description?: string
}

interface ApiResponse<T> {
  isSuccess: boolean
  result: T
  message?: string
}

const EMPTY_FORM: Omit<VehicleType, 'vehicleTypeId'> = {
  vehicleTypeName: '',
  description: '',
}

export default function ManagerVehicleTypes() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<VehicleType | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchVehicleTypes = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ApiResponse<VehicleType[]>>('/VehicleType')
      if (res.isSuccess) {
        setVehicleTypes(res.result)
      } else {
        setError(res.message ?? 'Không thể tải danh sách loại xe.')
      }
    } catch (e) {
      console.error(e)
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicleTypes()
  }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (v: VehicleType) => {
    setEditTarget(v)
    setForm({ vehicleTypeName: v.vehicleTypeName, description: v.description ?? '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditTarget(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editTarget) {
        await apiClient.put<ApiResponse<VehicleType>>('/VehicleType', {
          vehicleTypeId: editTarget.vehicleTypeId,
          ...form,
        })
      } else {
        await apiClient.post<ApiResponse<VehicleType>>('/VehicleType', form)
      }
      closeModal()
      await fetchVehicleTypes()
    } catch (e) {
      console.error(e)
      alert('Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Xóa loại xe "${name}"?`)) return
    try {
      await apiClient.delete<ApiResponse<unknown>>(`/VehicleType/${id}`)
      await fetchVehicleTypes()
    } catch (e) {
      console.error(e)
      alert('Xóa thất bại. Vui lòng thử lại.')
    }
  }

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
              {loading ? 'Đang tải...' : `${vehicleTypes.length} loại phương tiện đang áp dụng`}
            </p>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              <Plus size={18} aria-hidden />
              Thêm loại xe
            </button>
          </div>

          {error && (
            <div className="card-panel" style={{ color: 'var(--danger, #ef4444)', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div className="card-panel table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Tên loại</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}
                {!loading && vehicleTypes.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Chưa có loại phương tiện nào.
                    </td>
                  </tr>
                )}
                {vehicleTypes.map((v) => (
                  <tr key={v.vehicleTypeId}>
                    <td>{v.vehicleTypeName}</td>
                    <td>{v.description ?? '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(v)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(v.vehicleTypeId, v.vehicleTypeName)}
                      >
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="modal-panel">
            <h3 className="modal-title">{editTarget ? 'Sửa loại xe' : 'Thêm loại xe'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-field">
                <label htmlFor="vt-name">Tên loại xe *</label>
                <input
                  id="vt-name"
                  type="text"
                  required
                  value={form.vehicleTypeName}
                  onChange={(e) => setForm({ ...form, vehicleTypeName: e.target.value })}
                  placeholder="VD: Xe máy"
                />
              </div>
              <div className="form-field">
                <label htmlFor="vt-desc">Mô tả</label>
                <input
                  id="vt-desc"
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn (tuỳ chọn)"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Huỷ
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagerPageShell>
  )
}
