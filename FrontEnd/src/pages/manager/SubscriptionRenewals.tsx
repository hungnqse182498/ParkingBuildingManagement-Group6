import { useEffect, useState } from 'react'
import ManagerPageShell from '../../components/ManagerPageShell'
import { apiClient } from '../../config/api'

interface RenewalRequest {
  renewalId: string
  customerName?: string
  customerEmail?: string
  packageName?: string
  requestDate?: string
  renewalDate?: string
  status?: string
  amount?: number
  oldEndDate?: string
  newEndDate?: string
  adminNote?: string
  subscriptionId?: string
}

interface ApiResponse<T> {
  isSuccess: boolean
  result: T
  message?: string
}

export default function ManagerSubscriptionRenewals() {
  const [renewals, setRenewals] = useState<RenewalRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [activeModal, setActiveModal] = useState<'approve' | 'reject' | 'details' | null>(null)
  const [targetRenewal, setTargetRenewal] = useState<RenewalRequest | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Detailed info from GET /api/SubscriptionRenewal/{id}
  const [detailedInfo, setDetailedInfo] = useState<RenewalRequest | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const fetchRenewals = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ApiResponse<RenewalRequest[]>>('/SubscriptionRenewal')
      if (res.isSuccess) {
        setRenewals(res.result)
      } else {
        alert('Không thể tải danh sách yêu cầu gia hạn.')
        setError('Không thể tải danh sách yêu cầu gia hạn.')
      }
    } catch (e: any) {
      console.error(e)
      alert('Không thể tải danh sách yêu cầu gia hạn.')
      setError('Không thể tải danh sách yêu cầu gia hạn.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRenewals()
  }, [])

  // Helpers to get display values with fallback
  const getCustomerName = (r: RenewalRequest) =>
    r.customerName || (r.subscriptionId ? `Hợp đồng ${r.subscriptionId.substring(0, 8)}` : 'Chưa rõ')

  const getCustomerEmail = (r: RenewalRequest) => r.customerEmail || '—'

  const getPackageName = (r: RenewalRequest) => r.packageName || 'Gói cước'

  const getRequestDate = (r: RenewalRequest) => r.requestDate || r.renewalDate || ''

  const getStatus = (r: RenewalRequest) => r.status || 'Pending'

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'approved') return 'Đã duyệt'
    if (s === 'rejected') return 'Đã từ chối'
    return 'Chờ duyệt'
  }

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'approved') return 'badge-paid'
    if (s === 'rejected') return 'badge-unpaid'
    return 'badge-pending'
  }

  const getStatusBadgeStyle = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'approved') {
      return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }
    }
    if (s === 'rejected') {
      return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }
    }
    return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }
  }

  // Summary counts
  const totalCount = renewals.length
  const pendingCount = renewals.filter((r) => getStatus(r).toLowerCase() === 'pending').length
  const approvedCount = renewals.filter((r) => getStatus(r).toLowerCase() === 'approved').length
  const rejectedCount = renewals.filter((r) => getStatus(r).toLowerCase() === 'rejected').length

  // Action Triggers
  const openApprove = (r: RenewalRequest) => {
    setTargetRenewal(r)
    setActiveModal('approve')
  }

  const openReject = (r: RenewalRequest) => {
    setTargetRenewal(r)
    setAdminNote('')
    setActiveModal('reject')
  }

  const openDetails = async (r: RenewalRequest) => {
    setTargetRenewal(r)
    setDetailedInfo(null)
    setActiveModal('details')
    setDetailsLoading(true)
    try {
      const res = await apiClient.get<ApiResponse<RenewalRequest>>(`/SubscriptionRenewal/${r.renewalId}`)
      if (res.isSuccess) {
        setDetailedInfo(res.result)
      } else {
        // Fallback to table row data if details API is mocked or misses fields
        setDetailedInfo(r)
      }
    } catch (e) {
      console.error(e)
      setDetailedInfo(r)
    } finally {
      setDetailsLoading(false)
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setTargetRenewal(null)
    setAdminNote('')
    setDetailedInfo(null)
  }

  const handleUpdateStatus = async (status: 'Approved' | 'Rejected') => {
    if (!targetRenewal) return
    setSubmitting(true)
    try {
      const payload = {
        renewalId: targetRenewal.renewalId,
        status,
        adminNote: status === 'Rejected' ? adminNote.trim() || null : null,
      }
      const res = await apiClient.put<ApiResponse<unknown>>('/SubscriptionRenewal', payload)
      if (res.isSuccess) {
        closeModal()
        await fetchRenewals()
      } else {
        alert(res.message || 'Cập nhật thất bại. Vui lòng thử lại.')
      }
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu gia hạn này?')) return
    try {
      const res = await apiClient.delete<ApiResponse<unknown>>(`/SubscriptionRenewal/${id}`)
      if (res.isSuccess) {
        await fetchRenewals()
      } else {
        alert('Xóa thất bại. Vui lòng thử lại.')
      }
    } catch (e) {
      console.error(e)
      alert('Xóa thất bại. Vui lòng thử lại.')
    }
  }

  const formatDateTime = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '—'
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ'
  }

  return (
    <ManagerPageShell activeItem="renewals">
      <div className="staff-content-wrapper">
        <div className="staff-section">
          <h2>Quản lý gia hạn thuê bao</h2>
          <p className="section-desc">Xem và duyệt các yêu cầu gia hạn gói thuê bao từ khách hàng.</p>

          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tổng yêu cầu</span>
              <strong style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>{totalCount}</strong>
            </div>
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Chờ duyệt</span>
              <strong style={{ fontSize: '1.75rem', marginTop: '0.5rem', color: '#f59e0b' }}>{pendingCount}</strong>
            </div>
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Đã duyệt</span>
              <strong style={{ fontSize: '1.75rem', marginTop: '0.5rem', color: '#10b981' }}>{approvedCount}</strong>
            </div>
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Từ chối</span>
              <strong style={{ fontSize: '1.75rem', marginTop: '0.5rem', color: '#ef4444' }}>{rejectedCount}</strong>
            </div>
          </div>

          {error && (
            <div className="card-panel" style={{ color: 'var(--danger, #ef4444)', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div className="card-panel" style={{ marginTop: '1rem' }}>
            {loading && renewals.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</p>
            ) : (
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Mã yêu cầu</th>
                    <th>Khách hàng</th>
                    <th>Gói thuê bao</th>
                    <th>Ngày yêu cầu</th>
                    <th>Trạng thái</th>
                    <th style={{ width: '220px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {renewals.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Chưa có yêu cầu gia hạn nào.
                      </td>
                    </tr>
                  ) : (
                    renewals.map((r) => {
                      const status = getStatus(r)
                      const isPending = status.toLowerCase() === 'pending'
                      return (
                        <tr key={r.renewalId}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {r.renewalId.substring(0, 8)}...
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{getCustomerName(r)}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {getCustomerEmail(r)}
                              </span>
                            </div>
                          </td>
                          <td>{getPackageName(r)}</td>
                          <td>{formatDateTime(getRequestDate(r))}</td>
                          <td>
                            <span
                              className={`badge ${getStatusBadgeClass(status)}`}
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: '600',
                                ...getStatusBadgeStyle(status),
                              }}
                            >
                              {getStatusLabel(status)}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openApprove(r)}
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    style={{ borderColor: 'var(--danger, #ef4444)', color: 'var(--danger, #ef4444)' }}
                                    onClick={() => openReject(r)}
                                  >
                                    Từ chối
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => openDetails(r)}
                                  >
                                    Chi tiết
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    style={{ borderColor: 'var(--danger, #ef4444)', color: 'var(--danger, #ef4444)' }}
                                    onClick={() => handleDelete(r.renewalId)}
                                  >
                                    Xóa
                                  </button>
                                </>
                              )}
                            </div>
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

      {/* Approve Confirmation Modal */}
      {activeModal === 'approve' && targetRenewal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-panel">
            <h3 className="modal-title">Duyệt yêu cầu gia hạn</h3>
            <div style={{ marginBottom: '1.25rem' }}>
              <p>Bạn có chắc chắn muốn duyệt yêu cầu này?</p>
              <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Khách hàng:</td>
                    <td style={{ padding: '0.5rem 0', fontWeight: '600' }}>{getCustomerName(targetRenewal)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Gói thuê bao:</td>
                    <td style={{ padding: '0.5rem 0', fontWeight: '600' }}>{getPackageName(targetRenewal)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Ngày yêu cầu:</td>
                    <td style={{ padding: '0.5rem 0', fontWeight: '600' }}>
                      {formatDateTime(getRequestDate(targetRenewal))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={submitting}>
                Huỷ
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleUpdateStatus('Approved')}
                disabled={submitting}
              >
                {submitting ? 'Đang duyệt...' : 'Duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {activeModal === 'reject' && targetRenewal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-panel">
            <h3 className="modal-title">Từ chối yêu cầu gia hạn</h3>
            <div style={{ marginBottom: '1.25rem' }}>
              <p>Bạn có chắc chắn muốn từ chối yêu cầu của khách hàng <strong>{getCustomerName(targetRenewal)}</strong>?</p>
              <div className="form-field" style={{ marginTop: '1rem' }}>
                <label htmlFor="reject-note">Lý do từ chối (Ghi chú)</label>
                <textarea
                  id="reject-note"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập lý do từ chối yêu cầu..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={submitting}>
                Huỷ
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--danger, #ef4444)', borderColor: 'var(--danger, #ef4444)' }}
                onClick={() => handleUpdateStatus('Rejected')}
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {activeModal === 'details' && targetRenewal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-panel" style={{ maxWidth: '600px' }}>
            <h3 className="modal-title">Chi tiết yêu cầu gia hạn</h3>
            {detailsLoading ? (
              <p style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)' }}>Đang tải...</p>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Mã yêu cầu:</td>
                      <td style={{ padding: '0.75rem 0', fontWeight: '600', fontFamily: 'monospace' }}>
                        {detailedInfo?.renewalId}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Khách hàng:</td>
                      <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>
                        {detailedInfo ? getCustomerName(detailedInfo) : '—'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Email:</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        {detailedInfo ? getCustomerEmail(detailedInfo) : '—'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Gói thuê bao:</td>
                      <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>
                        {detailedInfo ? getPackageName(detailedInfo) : '—'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Ngày yêu cầu:</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        {detailedInfo ? formatDateTime(getRequestDate(detailedInfo)) : '—'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Số tiền thanh toán:</td>
                      <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>
                        {formatCurrency(detailedInfo?.amount)}
                      </td>
                    </tr>
                    {(detailedInfo?.oldEndDate || detailedInfo?.newEndDate) && (
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Thời hạn gia hạn:</td>
                        <td style={{ padding: '0.75rem 0' }}>
                          Từ <strong>{formatDateTime(detailedInfo.oldEndDate)}</strong> đến{' '}
                          <strong>{formatDateTime(detailedInfo.newEndDate)}</strong>
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Trạng thái:</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <span
                          className={`badge ${getStatusBadgeClass(detailedInfo ? getStatus(detailedInfo) : 'Pending')}`}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: '600',
                            ...getStatusBadgeStyle(detailedInfo ? getStatus(detailedInfo) : 'Pending'),
                          }}
                        >
                          {detailedInfo ? getStatusLabel(getStatus(detailedInfo)) : 'Chờ duyệt'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Ghi chú từ chối:</td>
                      <td style={{ padding: '0.75rem 0', fontStyle: 'italic' }}>
                        {detailedInfo?.adminNote || 'Không có ghi chú'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </ManagerPageShell>
  )
}
