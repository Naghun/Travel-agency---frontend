import React, { useState } from 'react'
import './ProgramDetails.scss'
import apiClient from '../../api/apiClient.jsx'

function ProgramDelete({ program, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/programs/${program.id}`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju.')
      setLoading(false)
    }
  }

  return (
    <div className="program-delete">
      <p>Da li ste sigurni da želite obrisati program <strong>"{program.naziv || program.name}"</strong>?</p>
      <p className="delete-warning">Ova akcija je nepovratna. Sve rezervacije i podaci vezani za ovaj program bit će trajno obrisani.</p>
      {error && <div className="delete-error">{error}</div>}
      <div className="delete-actions">
        <button className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button className="btn-delete" onClick={handleDelete} disabled={loading}>
          {loading ? 'Brisanje...' : 'Obriši program'}
        </button>
      </div>
    </div>
  )
}

export default ProgramDelete
