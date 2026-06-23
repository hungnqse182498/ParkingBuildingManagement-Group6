import { useEffect, useState } from 'react'
import ManagerPageShell from '../../components/ManagerPageShell'
import { apiClient } from '../../config/api'

interface IncidentReport {
  incidentReportId: number
  incidentCode?: string
  incidentType: string
  licensePlate: string
  reportedAt: string
  status: string
}

interface ApiResponse<T> {
  isSuccess: boolean
  result: T
  message?: string
}

const typeLabels: Record<string, string> = {
  'Mất vé': 'badge-cancelled',
  'Sai biển số': 'badge-paid',
  'Quá giờ đặt trước': 'badge-paid',
  'Gửi sai khu vực': 'badge-cancelled',
  'Chưa thanh toán': 'badge-cancelled',
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function ManagerAdvanced() {
  const [cases, setCases] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCases = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ApiResponse<IncidentReport[]>>('/IncidentReport')
      if (res.isSuccess) {
        setCases(res.result)
      } else {
        setError(res.message ?? 'Không thể tải danh sách sự vụ.')
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

  const handleProcess = () => {
    alert('Feature not supported yet')
  }

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Xóa sự vụ "${code}"?`)) return
    try {
      await apiClient.delete<ApiResponse<unknown>>(`/IncidentReport/${id}`)
      await fetchCases()
    } catch (e) {
      console.error(e)
      alert('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  const pendingCount = cases.filter((c) => c.status === 'pending' || c.status?.toLowerCase() === 'pending').length
  const resolvedCount = cases.filter((c) => c.status === 'resolved' || c.status?.toLowerCase() === 'resolved').length

  return (
    <ManagerPageShell activeItem="advanced">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý nâng cao</h2>
          <p className="section-desc">
            Theo dõi các trường hợp đặc biệt: mất vé, sai biển số, quá giờ, gửi sai khu vực, xe chưa thanh toán.
          </p>

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
                  const code = c.incidentCode ?? `IR-${c.incidentReportId}`
                  const isPending =
                    c.status?.toLowerCase() === 'pending' || c.status === 'pending'
                  return (
                    <tr key={c.incidentReportId}>
                      <td>{code}</td>
                      <td>
                        <span className={`badge ${typeLabels[c.incidentType] ?? ''}`}>
                          {c.incidentType}
                        </span>
                      </td>
                      <td>{c.licensePlate}</td>
                      <td>{formatTime(c.reportedAt)}</td>
                      <td>
                        {isPending ? (
                          <span className="badge badge-cancelled">Chờ xử lý</span>
                        ) : (
                          <span className="badge badge-paid">Đã xử lý</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleProcess}
                        >
                          Xử lý
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(c.incidentReportId, code)}
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
    </ManagerPageShell>
  )
}
