import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    try {
      const q = query(
        collection(db, 'studios', currentUser.uid, 'orders'),
        orderBy('date', 'asc')
      )
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // Monthly Revenue Data
  const monthlyData = orders.reduce((acc, o) => {
    const date = new Date(o.date)
    const month = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + Number(o.total || 0)
    return acc
  }, {})

  const revenueChart = Object.entries(monthlyData).map(([month, revenue]) => ({
    month,
    revenue,
  }))

  // Shoot Type Distribution
  const shootTypeData = orders.reduce((acc, o) => {
    acc[o.shootType] = (acc[o.shootType] || 0) + 1
    return acc
  }, {})

  const pieChart = Object.entries(shootTypeData).map(([type, count]) => ({
    name: type,
    value: count,
  }))

  // Status Breakdown
  const statusData = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const statusChart = Object.entries(statusData).map(([status, count]) => ({
    status,
    count,
  }))

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0)
  const totalAdvance = orders.reduce((s, o) => s + Number(o.advance || 0), 0)
  const pendingBalance = totalRevenue - totalAdvance
  const totalShoots = orders.length
  const completedShoots = orders.filter(o => o.status === 'Completed').length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text3)' }}>
      Loading...
    </div>
  )

  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>📊 Analytics</h2>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, color: '#10b981' },
          { label: 'Pending Balance', value: `₹${(pendingBalance / 1000).toFixed(1)}k`, color: '#f59e0b' },
          { label: 'Total Shoots', value: totalShoots, color: '#6366f1' },
          { label: 'Completed', value: completedShoots, color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg3)',
            border: `1px solid ${s.color}33`,
            borderLeft: `3px solid ${s.color}`,
            borderRadius: 14,
            padding: '14px 12px',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Monthly Revenue</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
            <YAxis tick={{ fontSize: 10, fill: '#888' }} />
            <Tooltip 
              contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
              itemStyle={{ color: '#10b981' }}
            />
            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Shoot Type Distribution */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Shoot Types</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieChart}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieChart.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {pieChart.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Order Status</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#888' }} />
            <YAxis tick={{ fontSize: 10, fill: '#888' }} />
            <Tooltip 
              contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
              itemStyle={{ color: '#6366f1' }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Advance vs Total Revenue Line Chart */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Revenue Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={revenueChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
            <YAxis tick={{ fontSize: 10, fill: '#888' }} />
            <Tooltip 
              contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8 }}
              itemStyle={{ color: '#10b981' }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Table */}
      <div style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Recent Orders</div>
        {orders.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            No orders yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Client</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Type</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px' }}>Total</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px' }}>Advance</th>
                  <th style={{ textAlign: 'center', padding: '8px 6px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice().reverse().map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border2)' }}>
                    <td style={{ padding: '8px 6px', color: 'var(--text1)' }}>{o.clientName || '-'}</td>
                    <td style={{ padding: '8px 6px', color: 'var(--text2)' }}>{o.date ? new Date(o.date).toLocaleDateString('en-IN') : '-'}</td>
                    <td style={{ padding: '8px 6px', color: 'var(--text2)' }}>{o.shootType || '-'}</td>
                    <td style={{ padding: '8px 6px', color: 'var(--text1)', textAlign: 'right', fontWeight: 600 }}>₹{Number(o.total || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 6px', color: '#10b981', textAlign: 'right' }}>₹{Number(o.advance || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 10,
                        fontWeight: 600,
                        background: o.status === 'Completed' ? '#10b98122' : o.status === 'Pending' ? '#f59e0b22' : '#6366f122',
                        color: o.status === 'Completed' ? '#10b981' : o.status === 'Pending' ? '#f59e0b' : '#6366f1',
                      }}>
                        {o.status || 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Spacer */}
      <div style={{ height: 40 }} />
    </div>
  )
}