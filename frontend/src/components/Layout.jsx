import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-logo">💰 FinSplit</div>
        <ul className="nav-links">
          <li><NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>📊 Dashboard</NavLink></li>
          <li><NavLink to="/transactions" className={({isActive}) => isActive ? 'active' : ''}>💸 Transactions</NavLink></li>
          <li><NavLink to="/groups" className={({isActive}) => isActive ? 'active' : ''}>👥 Groups</NavLink></li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-currency">{user?.currency}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
