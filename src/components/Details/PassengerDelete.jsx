import React, { useState } from 'react'
import apiClient from '../../api/apiClient.jsx'
import './PassengerDetails.scss'

function PassengerDelete({ passenger, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/passengers/${passenger.id}`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju.')
      setLoading(false)
    }
  }

  const fullName = `${passenger.first_name || passenger.ime || ''} ${passenger.last_name || passenger.prezime || ''}`.trim()

  return (
    <div className="program-delete">
      <p>Da li ste sigurni da želite obrisati putnika <strong>"{fullName}"</strong>?</p>
      <p className="delete-warning">Putnik se može obrisati samo ako nema aktivnih rezervacija. Ova akcija je nepovratna.</p>
      {error && <div className="delete-error">{error}</div>}
      <div className="delete-actions">
        <button className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button className="btn-delete" onClick={handleDelete} disabled={loading}>
          {loading ? 'Brisanje...' : 'Obriši putnika'}
        </button>
      </div>
    </div>
  )
}

export default PassengerDelete
