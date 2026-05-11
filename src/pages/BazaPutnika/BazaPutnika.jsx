import React, { useState, useEffect, useCallback } from 'react'
import './BazaPutnika.scss'
import PageHeader from '../../features/PageHeader/PageHeader'
import OneColumnData from '../../features/OneColumnData/OneColumnData'
import Table from '../../components/Table/Table'
import Modal from '../../components/Modal/Modal'
import PassengerForm from '../../components/Forms/PassengerForm'
import PassengerDetails from '../../components/Details/PassengerDetails'
import PassengerDelete from '../../components/Details/PassengerDelete'
import apiClient from '../../api/apiClient.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

const genderLabel = { male: 'Muški', female: 'Ženski', other: 'Ostalo' }
const formatDate  = (iso) => iso ? new Date(iso).toLocaleDateString('bs-BA') : ''

function BazaPutnika() {
  const [passengers, setPassengers]     = useState([])
  const [search, setSearch]             = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchPassengers = useCallback((q = '') => {
    const params = q ? { search: q } : {}
    apiClient.get('/passengers', { params })
      .then(res => setPassengers(res.data))
      .catch(err => console.error('Error fetching passengers:', err))
  }, [])

  useEffect(() => { fetchPassengers(search) }, [search, fetchPassengers])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const tableData = passengers.map(p => ({
    id: p.id,
    ime: p.first_name,
    prezime: p.last_name,
    email: p.email || '—',
    telefon: p.phone || '—',
    pasoš: p.passport_number || '—',
    spol: genderLabel[p.gender] || '—',
    putovanja: p.total_trips ?? 0,
  }))

  const getRaw = (row) => passengers.find(p => p.id === row.id) || row

  return (
    <div className="baza-putnika-container">
      <PageHeader title="Baza putnika" singular="putnika" onAdd={() => setShowCreateModal(true)} />

      <div className="bp-search-bar">
        <form onSubmit={handleSearch}>
          <div className="bp-search-input">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Pretraži po imenu, prezimenu, emailu, telefonu ili broju pasoša..."
            />
          </div>
          <button type="submit" className="bp-search-btn">Pretraži</button>
          {search && (
            <button type="button" className="bp-clear-btn" onClick={() => { setSearch(''); setSearchInput('') }}>
              Poništi
            </button>
          )}
        </form>
        <span className="bp-count">{passengers.length} putnika</span>
      </div>

      <OneColumnData>
        <Table
          content={tableData}
          renderView={(row) => <PassengerDetails passengerId={row.id} />}
          renderEdit={(row, onClose) => (
            <PassengerForm
              initialData={getRaw(row)}
              onSuccess={() => { onClose(); fetchPassengers(search) }}
              onCancel={onClose}
            />
          )}
          renderDelete={(row, onClose) => (
            <PassengerDelete
              passenger={getRaw(row)}
              onSuccess={() => { onClose(); fetchPassengers(search) }}
              onCancel={onClose}
            />
          )}
        />
      </OneColumnData>

      {showCreateModal && (
        <Modal title="Dodaj novog putnika" onClose={() => setShowCreateModal(false)}>
          <PassengerForm
            onSuccess={() => { setShowCreateModal(false); fetchPassengers(search) }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default BazaPutnika
