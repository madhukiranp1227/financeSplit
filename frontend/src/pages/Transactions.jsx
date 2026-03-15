import { useState, useEffect } from 'react'
import api from '../api/axios'
import './Transactions.css'

const CATEGORIES = {
  INCOME: ['SALARY','FREELANCE','INVESTMENT','BUSINESS','OTHER_INCOME'],
  EXPENSE: ['FOOD','RENT','TRANSPORT','UTILITIES','ENTERTAINMENT','HEALTH','SHOPPING','EDUCATION','TRAVEL','OTHER_EXPENSE']
}

const CAT_ICONS = { SALARY:'💼', FREELANCE:'💻', INVESTMENT:'📈', BUSINESS:'🏢', OTHER_INCOME:'💰',
  FOOD:'🍔', RENT:'🏠', TRANSPORT:'🚗', UTILITIES:'⚡', ENTERTAINMENT:'🎬',
  HEALTH:'🏥', SHOPPING:'🛍️', EDUCATION:'📚', TRAVEL:'✈️', OTHER_EXPENSE:'💸' }

const TransactionModal = ({ tx, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: tx?.title || '', description: tx?.description || '',
    amount: tx?.amount || '', type: tx?.type || 'EXPENSE',
    category: tx?.category || '', transactionDate: tx?.transactionDate || new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{tx ? 'Edit Transaction' : 'Add Transaction'}</h3>
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:14}}>
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Grocery shopping" required />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div className="form-group">
              <label>Type *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value, category:''})}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input type="number" step="0.01" min="0.01" value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" required />
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="">Select category</option>
                {CATEGORIES[form.type].map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Transactions = () => {
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const load = () => {
    const params = filter !== 'ALL' ? `?type=${filter}` : ''
    api.get(`/transactions${params}`).then(r => setTxs(Array.isArray(r.data) ? r.data : [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleSave = async (form) => {
    const payload = { ...form }
    if (!payload.category) delete payload.category
    if (editTx) await api.put(`/transactions/${editTx.id}`, payload)
    else await api.post('/transactions', payload)
    setShowModal(false); setEditTx(null); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await api.delete(`/transactions/${id}`); load()
  }

  const filtered = txs
  const totalIncome = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + parseFloat(t.amount), 0)
  const totalExpense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(t.amount), 0)

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-sub">Track your income and expenses</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTx(null); setShowModal(true) }}>+ Add</button>
      </div>

      <div className="tx-summary">
        <div className="tx-sum-item income"><span>Total Income</span><strong>+${totalIncome.toFixed(2)}</strong></div>
        <div className="tx-sum-item expense"><span>Total Expense</span><strong>-${totalExpense.toFixed(2)}</strong></div>
        <div className="tx-sum-item balance"><span>Balance</span><strong>${(totalIncome - totalExpense).toFixed(2)}</strong></div>
      </div>

      <div className="filter-tabs">
        {['ALL','INCOME','EXPENSE'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading ? <div className="loading-state">Loading...</div> : (
        <div className="tx-list">
          {filtered.length === 0 ? (
            <div className="empty-state">No transactions yet. <button className="link-btn" onClick={() => setShowModal(true)}>Add one!</button></div>
          ) : filtered.map(tx => (
            <div key={tx.id} className="tx-item">
              <div className="tx-icon">{CAT_ICONS[tx.category] || (tx.type === 'INCOME' ? '📈' : '📉')}</div>
              <div className="tx-info">
                <div className="tx-title">{tx.title}</div>
                <div className="tx-meta">{tx.category?.replace(/_/g,' ')} • {tx.transactionDate}</div>
              </div>
              <div className={`tx-amount ${tx.type === 'INCOME' ? 'income' : 'expense'}`}>
                {tx.type === 'INCOME' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
              </div>
              <div className="tx-actions">
                <button className="icon-btn" onClick={() => { setEditTx(tx); setShowModal(true) }}>✏️</button>
                <button className="icon-btn" onClick={() => handleDelete(tx.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <TransactionModal tx={editTx} onClose={() => { setShowModal(false); setEditTx(null) }} onSave={handleSave} />}
    </div>
  )
}

export default Transactions
