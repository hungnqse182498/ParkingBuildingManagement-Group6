import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import ManagerPageShell from '../../components/ManagerPageShell'
import { apiClient } from '../../config/api'

interface Floor {
  floorId: string
  floorName: string
  totalCapacity: number
  dedicatedVehicleTypeId?: string | null
  dedicatedVehicleTypeName?: string | null
  isResident?: boolean
  zones?: string[]
  vehicleTypes?: string[]
}

interface ApiResponse<T> {
  isSuccess: boolean
  result: T
  message?: string
}

const EMPTY_FORM = {
  floorName: '',
  capacity: '',
  isResident: false,
}

export default function ManagerFloorAssignment() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Floor | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchFloors = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ApiResponse<Floor[]>>('/Floor')
      if (res.isSuccess) {
        setFloors(res.result)
      } else {
        setError(res.message ?? 'Không thể tải danh sách tầng.')
      }
    } catch (e) {
      console.error(e)
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFloors()
  }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (f: Floor) => {
    setEditTarget(f)
    setForm({
      floorName: f.floorName,
      capacity: String(f.totalCapacity !== undefined ? f.totalCapacity : (f as any).capacity || 0),
      isResident: f.isResident ?? false,
    })
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
      const payload = {
        floorName: form.floorName.trim(),
        totalCapacity: Number(form.capacity),
        isResident: form.isResident,
        dedicatedVehicleTypeId: editTarget?.dedicatedVehicleTypeId || null,
      }

      if (editTarget) {
        // PUT endpoint is /Floor, payload contains floorId
        await apiClient.put<ApiResponse<unknown>>('/Floor', {
          floorId: editTarget.floorId,
          ...payload,
        })
      } else {
        // POST endpoint is /Floor
        await apiClient.post<ApiResponse<unknown>>('/Floor', payload)
      }
      closeModal()
      await fetchFloors()
    } catch (e) {
      console.error(e)
      alert('Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xóa tầng "${name}"?`)) return
    try {
      await apiClient.delete<ApiResponse<unknown>>(`/Floor/${id}`)
      await fetchFloors()
    } catch (e) {
      console.error(e)
      alert('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <ManagerPageShell activeItem="floors">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý phân tầng theo loại xe</h2>
          <p className="section-desc">
            Gán tầng hầm và khu vực cho từng loại phương tiện. Hướng dẫn nhân viên đưa xe vào đúng khu.
          </p>

          <div className="toolbar-row card-panel">
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {loading ? 'Đang tải...' : `${floors.length} tầng hầm đang hoạt động`}
            </p>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              <Plus size={18} aria-hidden />
              Thêm tầng
            </button>
          </div>

          {error && (
            <div className="card-panel" style={{ color: 'var(--danger, #ef4444)', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div className="floor-assignment-grid">
            {loading && floors.length === 0 && (
              <div className="card-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                Đang tải dữ liệu...
              </div>
            )}
            {!loading && floors.length === 0 && (
              <div className="card-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                Chưa có tầng hầm nào.
              </div>
            )}
            {floors.map((f) => {
              const cap = f.totalCapacity !== undefined ? f.totalCapacity : (f as any).capacity || 0
              const vtype = f.dedicatedVehicleTypeName || (f.vehicleTypes && f.vehicleTypes.length > 0 ? f.vehicleTypes.join(', ') : null)
              const zones = f.zones && f.zones.length > 0 ? f.zones : null

              return (
                <article key={f.floorId} className="card-panel floor-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <header className="floor-card-header">
                    <h3>{f.floorName}</h3>
                    <span className="badge badge-paid">{cap} slot</span>
                  </header>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Loại xe:</strong> {vtype || '—'}
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Khu vực:</strong>
                    <ul className="permission-list" style={{ marginTop: '0.25rem' }}>
                      {zones ? (
                        zones.map((z) => (
                          <li key={z}>{z}</li>
                        ))
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => openEdit(f)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ borderColor: 'var(--danger, #ef4444)', color: 'var(--danger, #ef4444)' }}
                      onClick={() => handleDelete(f.floorId, f.floorName)}
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="card-panel" style={{ marginTop: '1.5rem' }}>
            <h3 className="panel-subtitle">Ma trận phân tầng</h3>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Loại xe</th>
                  <th>Tầng được phép</th>
                  <th>Khu ưu tiên</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Xe máy</td>
                  <td>B2</td>
                  <td>M1, M2</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>Ô tô</td>
                  <td>B1</td>
                  <td>A1</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>SUV</td>
                  <td>B1</td>
                  <td>A2</td>
                  <td>Chỗ rộng hơn 20%</td>
                </tr>
                <tr>
                  <td>Xe điện</td>
                  <td>B3</td>
                  <td>E1</td>
                  <td>Có trạm sạc</td>
                </tr>
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
            <h3 className="modal-title">{editTarget ? 'Sửa tầng' : 'Thêm tầng'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-field">
                <label htmlFor="floor-name">Tên tầng *</label>
                <input
                  id="floor-name"
                  type="text"
                  required
                  value={form.floorName}
                  onChange={(e) => setForm({ ...form, floorName: e.target.value })}
                  placeholder="VD: Tầng B1"
                />
              </div>
              <div className="form-field">
                <label htmlFor="floor-capacity">Sức chứa (slot) *</label>
                <input
                  id="floor-capacity"
                  type="number"
                  required
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="VD: 96"
                />
              </div>
              <div className="form-field checkbox-row">
                <input
                  id="floor-resident"
                  type="checkbox"
                  checked={form.isResident}
                  onChange={(e) => setForm({ ...form, isResident: e.target.checked })}
                />
                <label htmlFor="floor-resident">Tầng cư dân</label>
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
