import { NavLink } from 'react-router-dom'
import { MdDashboard, MdListAlt, MdCalendarMonth, MdPeople, MdCardGiftcard, MdSettings } from 'react-icons/md'

const tabs = [
  { to: '/app/dashboard', icon: <MdDashboard size={22} />, label: 'Home' },
  { to: '/app/orders',    icon: <MdListAlt size={22} />,    label: 'Orders' },
  { to: '/app/calendar',  icon: <MdCalendarMonth size={22} />, label: 'Calendar' },
  { to: '/app/clients',   icon: <MdPeople size={22} />,     label: 'Clients' },
  { to: '/app/referral',  icon: <MdCardGiftcard size={22} />, label: 'Earn' },
  { to: '/app/settings',  icon: <MdSettings size={22} />,   label: 'Settings' },
]

export default function Navbar() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#0f1629',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      zIndex: 100,
    }}>
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 0',
            color: isActive ? 'var(--purple2)' : 'var(--text3)',
            fontSize: 10,
            fontWeight: isActive ? 700 : 400,
            gap: 2,
            transition: 'color 0.2s',
            borderTop: isActive ? '2px solid var(--purple)' : '2px solid transparent',
          })}
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}