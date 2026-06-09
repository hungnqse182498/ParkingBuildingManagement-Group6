import { useEffect, useState } from 'react'
import ManagerPageShell from '../../components/ManagerPageShell'
import { apiClient } from '../../config/api'

interface ParkingSlot {
  slotId: number
  slotCode: string
  floorName: string
  vehicleTypeName: string
  status: string
}

interface ApiResponse<T> {
  isSuccess: boolean
  result: T
  message?: string
}

// Normalize API status strings to local display keys
const STATUS_LABEL_MAP: Record<string, string> = {
  Available: 'Còn trống',
  Occupied: 'Đang sử dụng',
  Reserved: 'Đã đặt trước',
  Maintenance: 'Bảo trì',
  Locked: 'Tạm khóa',
}

const STATUS_BADGE_MAP: Record<string, string> = {
  Available: 'slot-badge--empty',
  Occupied: 'slot-badge--occupied',
  Reserved: 'slot-badge--reserved',
  Maintenance: 'slot-badge--maintenance',
  Locked: 'slot-badge--locked',
}

const STATUS_TILE_MAP: Record<string, string> = {
  Available: 'slot-tile--empty',
  Occupied: 'slot-tile--occupied',
  Reserved: 'slot-tile--reserved',
  Maintenance: 'slot-tile--maintenance',
  Locked: 'slot-tile--locked',
}

const EMPTY_FORM = { slotCode: '', floorName: '', vehicleTypeName: '', status: 'Available' }

function getLabel(status: string) {
  return STATUS_LABEL_MAP[status] ?? status
}

export default function ManagerSlots() {
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filterFloor, setFilterFloor] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<ParkingSlot | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchSlots = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ApiResponse<ParkingSlot[]>>('/ParkingSlot')
      if (res.isSuccess) {
        setSlots(res.result)
      } else {
        setError(res.message ?? 'Không thể tải danh sách slot.')
      }
    } catch (e) {
      console.error(e)
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  // Derived filter values
  const uniqueFloors = Array.from(new Set(slots.map((s) => s.floorName))).sort()
  const uniqueStatuses = Array.from(new Set(slots.map((s) => s.status)))

  const filteredSlots = slots.filter((s) => {
    const floorOk = filterFloor === 'all' || s.floorName === filterFloor
    const statusOk = filterStatus === 'all' || s.status === filterStatus
    return floorOk && statusOk
  })

  // Summary counts from full list
  const summaryCounts = uniqueStatuses.reduce<Record<string, number>>((acc, st) => {
    acc[st] = slots.filter((s) => s.status === st).length
    return acc
  }, {})

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (slot: ParkingSlot) => {
    setEditTarget(slot)
    setForm({
      slotCode: slot.slotCode,
      floorName: slot.floorName,
      vehicleTypeName: slot.vehicleTypeName,
      status: slot.status,
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
      if (editTarget) {
        await apiClient.put<ApiResponse<ParkingSlot>>('/ParkingSlot', {
          slotId: editTarget.slotId,
          ...form,
        })
      } else {
        await apiClient.post<ApiResponse<ParkingSlot>>('/ParkingSlot', form)
      }
      closeModal()
      await fetchSlots()
    } catch (e) {
      console.error(e)
      alert('Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Xóa slot "${code}"?`)) return
    try {
      await apiClient.delete<ApiResponse<unknown>>(`/ParkingSlot/${id}`)
      await fetchSlots()
    } catch (e) {
      console.error(e)
      alert('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <ManagerPageShell activeItem="slots">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý slot đỗ xe</h2>
          <p className="section-desc">
            Theo dõi trạng thái từng ô: còn trống, đang sử dụng, đã đặt trước, bảo trì hoặc tạm khóa.
          </p>

          {/* Summary cards */}
          <div className="slot-summary-grid">
            {uniqueStatuses.map((status) => (
              <article key={status} className={`slot-summary-card ${STATUS_TILE_MAP[status] ?? ''}`}>
                <strong>{summaryCounts[status] ?? 0}</strong>
                <span>{getLabel(status)}</span>
              </article>
            ))}
          </div>

          {/* Toolbar */}
          <div className="toolbar-row card-panel">
            <div className="form-field" style={{ margin: 0, flex: 1, maxWidth: 200 }}>
              <label htmlFor="filter-floor">Lọc tầng</label>
              <select
                id="filter-floor"
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {uniqueFloors.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="form-field" style={{ margin: 0, flex: 1, maxWidth: 220 }}>
              <label htmlFor="filter-status">Trạng thái</label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>{getLabel(s)}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end' }}
              onClick={openCreate}
            >
              Thêm slot
            </button>
          </div>

          {error && (
            <div className="card-panel" style={{ color: 'var(--danger, #ef4444)', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Visual grid */}
          <div className="slot-visual-grid">
            {loading && <span style={{ color: 'var(--text-muted)' }}>Đang tải...</span>}
            {filteredSlots.map((slot) => (
              <button
                key={slot.slotId}
                type="button"
                className={`slot-tile ${STATUS_TILE_MAP[slot.status] ?? ''}`}
                title={getLabel(slot.status)}
              >
                <span className="slot-tile-id">{slot.slotCode}</span>
                <span className="slot-tile-status">{getLabel(slot.status)}</span>
              </button>
            ))}
          </div>

          {/* Detail table */}
          <div className="card-panel table-wrap" style={{ marginTop: '1.5rem' }}>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Mã slot</th>
                  <th>Tầng</th>
                  <th>Loại xe</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}
                {!loading && filteredSlots.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Không có slot nào phù hợp.
                    </td>
                  </tr>
                )}
                {filteredSlots.map((slot) => (
                  <tr key={slot.slotId}>
                    <td>{slot.slotCode}</td>
                    <td>{slot.floorName}</td>
                    <td>{slot.vehicleTypeName}</td>
                    <td>
                      <span className={`slot-badge ${STATUS_BADGE_MAP[slot.status] ?? ''}`}>
                        {getLabel(slot.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(slot)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(slot.slotId, slot.slotCode)}
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
            <h3 className="modal-title">{editTarget ? 'Sửa slot' : 'Thêm slot'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-field">
                <label htmlFor="slot-code">Mã slot *</label>
                <input
                  id="slot-code"
                  type="text"
                  required
                  value={form.slotCode}
                  onChange={(e) => setForm({ ...form, slotCode: e.target.value })}
                  placeholder="VD: B1-A01"
                />
              </div>
              <div className="form-field">
                <label htmlFor="slot-floor">Tầng *</label>
                <input
                  id="slot-floor"
                  type="text"
                  required
                  value={form.floorName}
                  onChange={(e) => setForm({ ...form, floorName: e.target.value })}
                  placeholder="VD: B1"
                />
              </div>
              <div className="form-field">
                <label htmlFor="slot-vtype">Loại xe</label>
                <input
                  id="slot-vtype"
                  type="text"
                  value={form.vehicleTypeName}
                  onChange={(e) => setForm({ ...form, vehicleTypeName: e.target.value })}
                  placeholder="VD: Xe máy"
                />
              </div>
              <div className="form-field">
                <label htmlFor="slot-status">Trạng thái</label>
                <select
                  id="slot-status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Available">Còn trống</option>
                  <option value="Occupied">Đang sử dụng</option>
                  <option value="Reserved">Đã đặt trước</option>
                  <option value="Maintenance">Bảo trì</option>
                  <option value="Locked">Tạm khóa</option>
                </select>
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
