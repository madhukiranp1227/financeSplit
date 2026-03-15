import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement
} from 'chart.js'
import api from '../api/axios'
import './Dashboard.css'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CATEGORY_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#3b82f6','#84cc16','#f97316']

const fmt = (n) => {
  const num = parseFloat(n || 0)
  return num >= 1000 ? `$${(num/1000).toFixed(1)}k` : `$${num.toFixed(2)}`
}

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/transactions/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state">Loading dashboard...</div>
  if (!data) return <div className="loading-state">No data</div>

  const balance = parseFloat(data.balance || 0)
  const income = parseFloat(data.totalIncome || 0)
  const expense = parseFloat(data.totalExpense || 0)

  // Doughnut — expense by category
  const catLabels = Object.keys(data.expenseByCategory || {})
  const catValues = Object.values(data.expenseByCategory || {}).map(v => parseFloat(v))

  const doughnutData = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: CATEGORY_COLORS.slice(0, catLabels.length),
      borderWidth: 0,
    }]
  }

  // Bar — monthly income vs expense
  const incomeMap = {}
  const expenseMap = {}
  ;(data.monthlyIncome || []).forEach(d => { incomeMap[d.month] = parseFloat(d.amount) })
  ;(data.monthlyExpense || []).forEach(d => { expenseMap[d.month] = parseFloat(d.amount) })

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: MONTHS.map((_, i) => incomeMap[i+1] || 0), backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6 },
      { label: 'Expense', data: MONTHS.map((_, i) => expenseMap[i+1] || 0), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 6 },
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 } } },
    cutout: '65%'
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Your financial overview</p>
        <Link to="/transactions" className="btn btn-primary btn-sm">+ Add Transaction</Link>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className={`summary-card ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-icon">💳</div>
          <div className="summary-value">{fmt(Math.abs(balance))}</div>
          <div className="summary-label">Net Balance</div>
          <div className="summary-sub">{balance >= 0 ? '▲ Positive' : '▼ Negative'}</div>
        </div>
        <div className="summary-card income-card">
          <div className="summary-icon">📈</div>
          <div className="summary-value" style={{color:'var(--success)'}}>{fmt(income)}</div>
          <div className="summary-label">Total Income</div>
          <div className="summary-sub" style={{color:'var(--success)'}}>This year: {fmt(data.monthIncome)}</div>
        </div>
        <div className="summary-card expense-card">
          <div className="summary-icon">📉</div>
          <div className="summary-value" style={{color:'var(--danger)'}}>{fmt(expense)}</div>
          <div className="summary-label">Total Expenses</div>
          <div className="summary-sub" style={{color:'var(--danger)'}}>This month: {fmt(data.monthExpense)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-value" style={{color:'var(--warning)'}}>
            {income > 0 ? Math.round((expense/income)*100) : 0}%
          </div>
          <div className="summary-label">Expense Ratio</div>
          <div className="summary-sub">of total income spent</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card chart-card">
          <h3 className="chart-title">Monthly Overview</h3>
          <Bar data={barData} options={chartOptions} />
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Expense by Category</h3>
          {catLabels.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="empty-chart">No expense data yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
