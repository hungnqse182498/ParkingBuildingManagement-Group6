import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Car, CreditCard, ShieldAlert } from 'lucide-react'
import { apiClient } from '../../config/api'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatUtcToVietnamDateTime } from '../../utils/dateTime'
import { formatCurrency } from '../../utils/pricing'
import { type MonthlySubscriptionDto, subscriptionApi } from '../../utils/apiServices'
import { ToastContainer, useToast } from '../../components/Toast'

function getStatusBadgeClass(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'active') {
    return 'badge-history-success'
  }
  if (normalized === 'pendingpayment') {
    return 'badge-history-pending'
  }
  if (normalized === 'expired') {
    return 'badge-history-cancelled'
  }
  return 'badge-history-neutral'
}

function getStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Hoạt động'
    case 'pendingpayment':
      return 'Chờ thanh toán'
    case 'expired':
      return 'Hết hạn'
    default:
      return status
  }
}

function MySubscriptionsContent() {
  const [subscriptions, setSubscriptions] = useState<MonthlySubscriptionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payingId, setPayingId] = useState<string | null>(null)
  const toast = useToast()

  const loadSubscriptions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get<any>('/MonthlySubscription/my')
      if (res.isSuccess && Array.isArray(res.result)) {
        const sorted = [...res.result].sort((a, b) => {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        })
        setSubscriptions(sorted)
      } else {
        setError(res.message || 'Không thể tải danh sách gói đăng ký.')
      }
    } catch (err: unknown) {
      console.error(err)
      setError('Đã xảy ra lỗi khi kết nối đến máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const handleRepayment = async (id: string) => {
    setPayingId(id)
    try {
      const res = await subscriptionApi.createPayment(id)
      if (res.isSuccess && res.result?.paymentUrl) {
        window.location.href = res.result.paymentUrl
      } else {
        toast.error(res.message || 'Lỗi khi tạo lại link thanh toán.')
      }
    } catch (err: unknown) {
      console.error(err)
      let msg = 'Đã xảy ra lỗi, vui lòng thử lại sau.'
      if (err instanceof Error) {
        try {
          const body = JSON.parse(err.message.replace(/^HTTP \d+: /, ''))
          if (body?.message) msg = body.message
        } catch { /* ignore */ }
      }
      toast.error(msg)
    } finally {
      setPayingId(null)
    }
  }

  return (
    <section className="my-subscriptions-page">
      <ToastContainer toasts={toast.toasts} onClose={toast.close} />

      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Gói đăng ký của tôi</h1>
          <p>Danh sách lịch sử và các gói thuê bao tháng của bạn.</p>
        </div>
      </header>

      {loading ? (
        <div className="empty-state card-panel">
          <p>Đang tải...</p>
        </div>
      ) : error ? (
        <div className="empty-state card-panel">
          <ShieldAlert size={40} strokeWidth={1.5} className="success-icon" style={{ color: 'var(--danger, #ef4444)' }} />
          <p>{error}</p>
          <button onClick={loadSubscriptions} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Thử lại
          </button>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="empty-state card-panel">
          <CreditCard size={40} strokeWidth={1.5} aria-hidden />
          <p>Bạn chưa đăng ký gói nào.</p>
          <Link to="/dang-ky-thang" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Đăng ký ngay
          </Link>
        </div>
      ) : (
        <div
          className="subscriptions-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
            marginTop: '1.5rem',
          }}
        >
          {subscriptions.map((sub, i) => (
            <motion.div
              key={sub.subscriptionId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-panel"
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.75rem',
                    gap: '0.5rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-heading)' }}>
                    {sub.packageName || 'Gói thuê bao tháng'}
                  </h3>
                  <span className={`badge ${getStatusBadgeClass(sub.status)}`} style={{ flexShrink: 0 }}>
                    {getStatusLabel(sub.status)}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Car size={16} />
                    <span>
                      Biển số: <strong>{sub.licensePlate}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>Loại xe:</span>
                    <span>{sub.vehicleType || 'Không rõ'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>Chỗ đỗ:</span>
                    <span>
                      {sub.fixedSlot ? (
                        <span style={{ color: 'var(--blue-600)', fontWeight: 600 }}>
                          Chỗ cố định: {sub.fixedSlot}
                        </span>
                      ) : (
                        'Không có chỗ cố định'
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px dashed var(--border)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div>
                      Bắt đầu: <strong>{formatUtcToVietnamDateTime(sub.startDate)}</strong>
                    </div>
                    <div>
                      Kết thúc: <strong>{formatUtcToVietnamDateTime(sub.endDate)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Giá thanh toán</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>
                    {formatCurrency(sub.price)}
                  </strong>
                </div>

                {sub.status.toLowerCase() === 'pendingpayment' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={payingId === sub.subscriptionId}
                    onClick={() => handleRepayment(sub.subscriptionId)}
                  >
                    {payingId === sub.subscriptionId ? 'Đang xử lý...' : 'Thanh toán lại'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function MySubscriptions() {
  return (
    <ProtectedRoute>
      <MySubscriptionsContent />
    </ProtectedRoute>
  )
}
