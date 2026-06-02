import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="card-panel" style={{ margin: '1rem' }}>
      <h1>EasyParking</h1>
      <p>Trang chủ tạm thời.</p>
      <p>
        <Link to="/dang-nhap">Đăng nhập</Link>
      </p>
    </section>
  )
}
