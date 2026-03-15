import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Groups.css'

const TYPE_ICONS = { TRIP:'✈️', HOME:'🏠', FRIENDS:'👫', WORK:'💼', OTHER:'👥' }

const Groups = () => {
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', type: 'OTHER', memberEmails: '' })

  useEffect(() => {
    api.get('/groups').then(r => setGroups(Array.isArray(r.data) ? r.data : []))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const emails = form.memberEmails.split(',').map(e => e.trim()).filter(Boolean)
    await api.post('/groups', { ...form, memberEmails: emails })
    setShowModal(false)
    const r = await api.get('/groups')
    setGroups(Array.isArray(r.data) ? r.data : [])
  }

  return (
    <div className="groups-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-sub">Split bills with friends, family & colleagues</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Group</button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-groups">
          <div className="empty-icon">👥</div>
          <h3>No groups yet</h3>
          <p>Create a group to start splitting expenses</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create First Group</button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map(g => (
            <Link to={`/groups/${g.id}`} key={g.id} className="group-card">
              <div className="group-type-icon">{TYPE_ICONS[g.type] || '👥'}</div>
              <div className="group-info">
                <h3 className="group-name">{g.name}</h3>
                {g.description && <p className="group-desc">{g.description}</p>}
                <span className="group-type-badge">{g.type}</span>
              </div>
              <div className="group-arrow">→</div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Create New Group</h3>
            <form onSubmit={handleCreate} style={{display:'flex', flexDirection:'column', gap:14}}>
              <div className="form-group">
                <label>Group Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Goa Trip 2025" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                  <option value="TRIP">✈️ Trip</option>
                  <option value="HOME">🏠 Home</option>
                  <option value="FRIENDS">👫 Friends</option>
                  <option value="WORK">💼 Work</option>
                  <option value="OTHER">👥 Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Invite Members (comma-separated emails)</label>
                <input value={form.memberEmails} onChange={e => setForm({...form, memberEmails:e.target.value})} placeholder="friend@example.com, other@example.com" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Groups
