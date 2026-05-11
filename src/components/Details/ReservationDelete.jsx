import React, { useState } from 'react'
import apiClient from '../../api/apiClient.jsx'
import './ProgramDetails.scss'

function ReservationDelete({ reservation, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/reservations/${reservation.id}`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju.')
      setLoading(false)
    }
  }

  return (
    <div className="program-delete">
      <p>Da li ste sigurni da želite obrisati rezervaciju za <strong>{reservation.first_name} {reservation.last_name}</strong> na programu <strong>"{reservation.program_name}"</strong>?</p>
      <p className="delete-warning">Brisanjem rezervacije bit će obrisana i faktura i sve uplate vezane za nju.</p>
      {error && <div className="delete-error">{error}</div>}
      <div className="delete-actions">
        <button className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button className="btn-delete" onClick={handleDelete} disabled={loading}>
          {loading ? 'Brisanje...' : 'Obriši rezervaciju'}
        </button>
      </div>
    </div>
  )
}

export default ReservationDelete
