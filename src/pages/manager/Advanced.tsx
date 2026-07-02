import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import ManagerPageShell from '../../components/ManagerPageShell'
import { apiClient } from '../../config/api'
import { useAuth } from '../../context/AuthContext'
import { formatUtcToVietnamDateTime } from '../../utils/dateTime'

interface IncidentReport {
  incidentId: string
  incidentReportId?: number    // legacy fallback
  incidentCode?: string
  incidentType?: string        // mapped from IssueType
  issueType?: string
  licensePlate?: string
  reportedAt?: string
  resolvedAt?: string
  status: string
  description?: string
  resolutionNotes?: string
  reportedByUserId?: string
  handledByStaffId?: string
}

interface ApiResponse<T> {
  isSuccess: boolean
  result: T
  message?: string
}

// Incident type options for dropdown
const INCIDENT_TYPES = [
  'Mất vé',
  'Sai biển số',
  'Quá giờ đặt trước',
  'Gửi sai khu vực',
  'Chưa thanh toán',
]

const typeLabels: Record<string, string> = {
  'Mất vé': 'badge-cancelled',
  'Sai biển số': 'badge-paid',
  'Quá giờ đặt trước': 'badge-paid',
  'Gửi sai khu vực': 'badge-cancelled',
  'Chưa thanh toán': 'badge-cancelled',
}

function formatTime(iso?: string) {
  if (!iso) return '—'
  try {
    return formatUtcToVietnamDateTime(iso)
  } catch {
    return iso
  }
}

function isPending(status: string) {
  const s = status?.toLowerCase()
  return s === 'open' || s === 'inprogress' || s === 'pending'
}

function isResolved(status: string) {
  return status?.toLowerCase() === 'resolved'
}

function getDisplayStatus(status: string) {
  const s = status?.toLowerCase()
  if (s === 'resolved') return 'Đã xử lý'
  if (s === 'cancelled') return 'Đã hủy'
  if (s === 'inprogress') return 'Đang xử lý'
  return 'Chờ xử lý'
}

function getStatusBadge(status: string) {
  const s = status?.toLowerCase()
  if (s === 'resolved') return 'badge-paid'
  if (s === 'cancelled') return 'badge-cancelled'
  if (s === 'inprogress') return 'badge-paid'
  return 'badge-cancelled'
}

const EMPTY_CREATE_FORM = {
  incidentType: INCIDENT_TYPES[0],
  licensePlate: '',
  description: '',
}

const EMPTY_PROCESS_FORM = {
  status: 'Resolved',
  resolutionNotes: '',
}

export default function ManagerAdvanced() {
  const { user } = useAuth()
  const [cases, setCases] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [creating, setCreating] = useState(false)

  // Process Modal
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processTarget, setProcessTarget] = useState<IncidentReport | null>(null)
  const [processForm, setProcessForm] = useState(EMPTY_PROCESS_FORM)
  const [processing, setProcessing] = useState(false)

  const fetchCases = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ApiResponse<IncidentReport[]>>('/IncidentReport')
      if (res.isSuccess) {
        setCases(res.result ?? [])
      } else {
        // 404 = no incidents yet — treat as empty list
        if ((res as any).statusCode === 404 || (res as any).StatusCode === 404) {
          setCases([])
        } else {
          setError(res.message ?? 'Không thể tải danh sách sự vụ.')
        }
      }
    } catch (e) {
      console.error(e)
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  // ── Create ──────────────────────────────────────────────────
  const openCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM)
    setShowCreateModal(true)
  }

  const closeCreate = () => {
    setShowCreateModal(false)
    setCreateForm(EMPTY_CREATE_FORM)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await apiClient.post<ApiResponse<unknown>>('/IncidentReport', {
        reportedByUserId: user?.userId ?? '00000000-0000-0000-0000-000000000000',
        incidentType: createForm.incidentType,
        issueType: createForm.incidentType,
        licensePlate: createForm.licensePlate.trim(),
        description: createForm.description.trim() || createForm.incidentType,
        status: 'Open',
      })
      closeCreate()
      await fetchCases()
    } catch (e) {
      console.error(e)
      alert('Tạo sự vụ thất bại. Vui lòng thử lại.')
    } finally {
      setCreating(false)
    }
  }

  // ── Process ─────────────────────────────────────────────────
  const openProcess = (incident: IncidentReport) => {
    setProcessTarget(incident)
    setProcessForm({
      status: 'Resolved',
      resolutionNotes: incident.resolutionNotes ?? '',
    })
    setShowProcessModal(true)
  }

  const closeProcess = () => {
    setShowProcessModal(false)
    setProcessTarget(null)
    setProcessForm(EMPTY_PROCESS_FORM)
  }

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!processTarget) return
    setProcessing(true)

    const id = processTarget.incidentId ?? String(processTarget.incidentReportId)
    const payload = {
      status: processForm.status,
      resolutionNotes: processForm.resolutionNotes.trim() || null,
    }

    let success = false
    try {
      // Try PATCH first
      const res = await apiClient.patch<ApiResponse<unknown>>(
        `/IncidentReport/${id}/status`,
        payload
      )
      if ((res as any).isSuccess || (res as any).statusCode !== 404) {
        success = true
      }
    } catch (err: any) {
      // PATCH 404 → fallback to PUT
      const status = err?.message?.match(/HTTP (\d+)/)?.[1]
      if (status === '404') {
        try {
          await apiClient.put<ApiResponse<unknown>>(
            `/IncidentReport/${id}`,
            payload
          )
          success = true
        } catch (e2) {
          console.error('PUT also failed:', e2)
        }
      } else {
        console.error('PATCH failed:', err)
      }
    }

    if (success) {
      closeProcess()
      await fetchCases()
    } else {
      alert('Tính năng này chưa được hỗ trợ trên server.')
    }
    setProcessing(false)
  }

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (incident: IncidentReport, code: string) => {
    if (!window.confirm(`Xóa sự vụ "${code}"?`)) return
    const id = incident.incidentId ?? String(incident.incidentReportId)
    try {
      await apiClient.delete<ApiResponse<unknown>>(`/IncidentReport/${id}`)
      await fetchCases()
    } catch (e) {
      console.error(e)
      alert('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  // ── Summary counts ───────────────────────────────────────────
  const pendingCount = cases.filter((c) => isPending(c.status)).length
  const resolvedCount = cases.filter((c) => isResolved(c.status)).length

  return (
    <ManagerPageShell activeItem="advanced">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý nâng cao</h2>
          <p className="section-desc">
            Theo dõi các trường hợp đặc biệt: mất vé, sai biển số, quá giờ, gửi sai khu vực, xe chưa thanh toán.
          </p>

          {/* Toolbar */}
          <div className="toolbar-row card-panel">
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {loading ? 'Đang tải...' : `${cases.length} sự vụ · ${pendingCount} chờ xử lý`}
            </p>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              <Plus size={18} aria-hidden />
              Thêm sự vụ
            </button>
          </div>

          {/* Summary cards */}
          <div className="slot-summary-grid">
            <article className="slot-summary-card slot-summary--reserved">
              <strong>{loading ? '—' : pendingCount}</strong>
              <span>Đang xử lý</span>
            </article>
            <article className="slot-summary-card slot-summary--empty">
              <strong>{loading ? '—' : resolvedCount}</strong>
              <span>Đã xử lý</span>
            </article>
            <article className="slot-summary-card slot-summary--maintenance">
              <strong>{loading ? '—' : cases.length}</strong>
              <span>Tổng sự vụ</span>
            </article>
          </div>

          {error && (
            <div className="card-panel" style={{ color: 'var(--danger, #ef4444)', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Table */}
          <div className="card-panel table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Mã sự vụ</th>
                  <th>Loại</th>
                  <th>Biển số</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}
                {!loading && cases.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Không có sự vụ nào.
                    </td>
                  </tr>
                )}
                {cases.map((c) => {
                  const displayId = c.incidentId ?? String(c.incidentReportId)
                  const code = c.incidentCode ?? `IR-${displayId.slice(0, 8).toUpperCase()}`
                  const type = c.incidentType ?? c.issueType ?? '—'
                  const plate = c.licensePlate ?? '—'
                  const time = formatTime(c.reportedAt ?? c.resolvedAt)

                  return (
                    <tr key={displayId}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{code}</td>
                      <td>
                        <span className={`badge ${typeLabels[type] ?? 'badge-paid'}`}>
                          {type}
                        </span>
                      </td>
                      <td>{plate}</td>
                      <td>{time}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(c.status)}`}>
                          {getDisplayStatus(c.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openProcess(c)}
                          disabled={isResolved(c.status)}
                          title={isResolved(c.status) ? 'Đã xử lý xong' : 'Xử lý sự vụ'}
                        >
                          Xử lý
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(c, code)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Create Incident Modal ── */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeCreate() }}
        >
          <div className="modal-panel">
            <h3 className="modal-title">Thêm sự vụ mới</h3>
            <form onSubmit={handleCreate}>
              <div className="form-field">
                <label htmlFor="inc-type">Loại sự vụ *</label>
                <select
                  id="inc-type"
                  required
                  value={createForm.incidentType}
                  onChange={(e) => setCreateForm({ ...createForm, incidentType: e.target.value })}
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="inc-plate">Biển số xe *</label>
                <input
                  id="inc-plate"
                  type="text"
                  required
                  value={createForm.licensePlate}
                  onChange={(e) => setCreateForm({ ...createForm, licensePlate: e.target.value })}
                  placeholder="VD: 51G-12345"
                />
              </div>
              <div className="form-field">
                <label htmlFor="inc-desc">Mô tả chi tiết</label>
                <textarea
                  id="inc-desc"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Mô tả tình huống (tuỳ chọn)"
                  style={{ width: '100%', resize: 'vertical', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: '0.9375rem' }}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeCreate}>
                  Huỷ
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Đang lưu...' : 'Tạo sự vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Process Incident Modal ── */}
      {showProcessModal && processTarget && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeProcess() }}
        >
          <div className="modal-panel">
            <h3 className="modal-title">Xử lý sự vụ</h3>

            {/* Read-only info */}
            <div className="card-panel" style={{ marginBottom: '1rem', background: 'var(--bg)', fontSize: '0.9375rem' }}>
              <p style={{ marginBottom: '0.35rem' }}>
                <strong>Loại:</strong> {processTarget.incidentType ?? processTarget.issueType ?? '—'}
              </p>
              <p style={{ marginBottom: '0.35rem' }}>
                <strong>Biển số:</strong> {processTarget.licensePlate ?? '—'}
              </p>
              <p style={{ marginBottom: '0.35rem' }}>
                <strong>Thời gian:</strong> {formatTime(processTarget.reportedAt)}
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Trạng thái hiện tại:</strong>{' '}
                <span className={`badge ${getStatusBadge(processTarget.status)}`}>
                  {getDisplayStatus(processTarget.status)}
                </span>
              </p>
            </div>

            <form onSubmit={handleProcess}>
              <div className="form-field">
                <label htmlFor="proc-status">Cập nhật trạng thái *</label>
                <select
                  id="proc-status"
                  required
                  value={processForm.status}
                  onChange={(e) => setProcessForm({ ...processForm, status: e.target.value })}
                >
                  <option value="Open">Chờ xử lý</option>
                  <option value="InProgress">Đang xử lý</option>
                  <option value="Resolved">Đã xử lý</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="proc-notes">Ghi chú xử lý</label>
                <textarea
                  id="proc-notes"
                  rows={3}
                  value={processForm.resolutionNotes}
                  onChange={(e) => setProcessForm({ ...processForm, resolutionNotes: e.target.value })}
                  placeholder="Ghi chú về cách giải quyết (tuỳ chọn)"
                  style={{ width: '100%', resize: 'vertical', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: '0.9375rem' }}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeProcess}>
                  Huỷ
                </button>
                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {processing ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagerPageShell>
  )
}
