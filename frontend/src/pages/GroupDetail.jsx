import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import './GroupDetail.css'

const GroupDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [balance, setBalance] = useState(null)
  const [tab, setTab] = useState('expenses')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [expenseForm, setExpenseForm] = useState({ title:'', totalAmount:'', splitType:'EQUAL', expenseDate:'' })

  const load = async () => {
    const [g, m, e, b] = await Promise.all([
      api.get(`/groups/${id}`),
      api.get(`/groups/${id}/members`),
      api.get(`/groups/${id}/expenses`),
      api.get(`/groups/${id}/balance`)
    ])
    setGroup(g.data)
    setMembers(Array.isArray(m.data) ? m.data : [])
    setExpenses(Array.isArray(e.data) ? e.data : [])
    setBalance(b.data)
  }

  useEffect(() => { load() }, [id])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    await api.post(`/groups/${id}/expenses`, expenseForm)
    setShowExpenseModal(false)
    setExpenseForm({ title:'', totalAmount:'', splitType:'EQUAL', expenseDate:'' })
    load()
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    await api.post(`/groups/${id}/members`, { email: memberEmail })
    setShowAddMember(false); setMemberEmail('')
    load()
  }

  const handleSettle = async (toUserId, amount) => {
    if (!confirm(`Settle $${amount} with this person?`)) return
    await api.post(`/groups/${id}/settle`, { payeeId: toUserId, amount })
    load()
  }

  if (!group) return <div className="loading-state">Loading...</div>

  return (
    <div className="group-detail">
      <div className="group-detail-header">
        <div>
          <Link to="/groups" className="back-link">← Groups</Link>
          <h1 className="page-title">{group.name}</h1>
          {group.description && <p className="page-sub">{group.description}</p>}
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddMember(true)}>+ Member</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseModal(true)}>+ Expense</button>
        </div>
      </div>

      {/* Balance Summary */}
      {balance && (
        <div className="balance-summary">
          <div className="balance-card">
            <div className="balance-total">${parseFloat(balance.totalExpenses || 0).toFixed(2)}</div>
            <div className="balance-label">Total Expenses</div>
          </div>
          <div className="member-balances">
            {(balance.balances || []).map(b => (
              <div key={b.userId} className={`member-balance-item ${b.net >= 0 ? 'positive' : 'negative'}`}>
                <span className="member-avatar">{b.userName?.charAt(0)}</span>
                <span className="member-name">{b.userName}</span>
                <span className="member-net">{b.net >= 0 ? '+' : ''}${parseFloat(b.net || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlement Suggestions */}
      {balance?.suggestions?.length > 0 && (
        <div className="suggestions-card card">
          <h3 className="section-title">💡 Suggested Settlements</h3>
          {balance.suggestions.map((s, i) => (
            <div key={i} className="suggestion-item">
              <span className="suggestion-text">
                <strong>{s.fromUserName}</strong> owes <strong>{s.toUserName}</strong> ${parseFloat(s.amount).toFixed(2)}
              </span>
              {s.fromUserId === user?.userId && (
                <button className="btn btn-success btn-sm" onClick={() => handleSettle(s.toUserId, s.amount)}>
                  Settle Up
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="detail-tabs">
        <button className={`detail-tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>Expenses ({expenses.length})</button>
        <button className={`detail-tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Members ({members.length})</button>
      </div>

      {tab === 'expenses' && (
        <div className="expense-list">
          {expenses.length === 0 ? (
            <div className="empty-state">No expenses yet. <button className="link-btn" onClick={() => setShowExpenseModal(true)}>Add one!</button></div>
          ) : expenses.map(e => (
            <div key={e.id} className="expense-item">
              <div className="expense-icon">🧾</div>
              <div className="expense-info">
                <div className="expense-title">{e.title}</div>
                <div className="expense-meta">Paid by {e.paidBy?.name} • {e.expenseDate} • {e.splitType}</div>
              </div>
              <div className="expense-amount">${parseFloat(e.totalAmount).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div className="members-list">
          {members.map(m => (
            <div key={m.id} className="member-item">
              <div className="member-avatar-lg">{m.user?.name?.charAt(0)}</div>
              <div className="member-info">
                <div className="member-name-lg">{m.user?.name}</div>
                <div className="member-email">{m.user?.email}</div>
              </div>
              <span className={`member-role ${m.role}`}>{m.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Add Group Expense</h3>
            <form onSubmit={handleAddExpense} style={{display:'flex', flexDirection:'column', gap:14}}>
              <div className="form-group">
                <label>Title *</label>
                <input value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title:e.target.value})} placeholder="e.g. Hotel booking" required />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div className="form-group">
                  <label>Amount *</label>
                  <input type="number" step="0.01" value={expenseForm.totalAmount}
                    onChange={e => setExpenseForm({...expenseForm, totalAmount:e.target.value})} placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label>Split Type</label>
                  <select value={expenseForm.splitType} onChange={e => setExpenseForm({...expenseForm, splitType:e.target.value})}>
                    <option value="EQUAL">Equal Split</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={expenseForm.expenseDate} onChange={e => setExpenseForm({...expenseForm, expenseDate:e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Add Member</h3>
            <form onSubmit={handleAddMember} style={{display:'flex', flexDirection:'column', gap:14}}>
              <div className="form-group">
                <label>Member Email *</label>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="friend@example.com" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddMember(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupDetail
