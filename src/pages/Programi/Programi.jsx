import React, { useState, useEffect, useCallback } from 'react'
import './Programi.scss'
import OneColumnSection from '../../features/OneColumnSection/OneColumnSection'
import PageHeader from '../../features/PageHeader/PageHeader'
import OneColumnData from '../../features/OneColumnData/OneColumnData'
import FilterSelector from '../../components/Filters/FilterSelector/FilterSelector'
import Table from '../../components/Table/Table'
import Modal from '../../components/Modal/Modal'
import ProgramForm from '../../components/Forms/ProgramForm'
import ProgramDetails from '../../components/Details/ProgramDetails'
import ProgramDelete from '../../components/Details/ProgramDelete'
import apiClient from '../../api/apiClient.jsx'

const statusOptions = ["Svi", "Planirano", "Aktivno", "Završeno", "Odgođeno", "Otkazano"]

const statusMap = {
  planned: "Planirano", active: "Aktivno",
  completed: "Završeno", postponed: "Odgođeno", cancelled: "Otkazano",
}

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('bs-BA')
}

function Programi() {
  const [programs, setPrograms] = useState([])
  const [selectedStatus, setSelectedStatus] = useState("Svi")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editProgram, setEditProgram] = useState(null)
  const [deleteProgram, setDeleteProgram] = useState(null)

  const fetchPrograms = useCallback(() => {
    apiClient.get('/programs')
      .then(res => setPrograms(res.data))
      .catch(err => console.error('Error fetching programs:', err))
  }, [])

  useEffect(() => { fetchPrograms() }, [fetchPrograms])

  const counts = statusOptions.reduce((acc, status) => {
    if (status === "Svi") acc[status] = programs.length
    else acc[status] = programs.filter(p => statusMap[p.status] === status).length
    return acc
  }, {})

  const filteredData = selectedStatus === "Svi"
    ? programs
    : programs.filter(p => statusMap[p.status] === selectedStatus)

  const tableData = filteredData.map(p => ({
    id: p.id,
    naziv: p.name,
    destinacija: p.destination,
    datum: `${formatDate(p.start_date)} – ${formatDate(p.end_date)}`,
    cijena: `${p.base_price} ${p.currency || 'KM'}`,
    rezervacije: `${p.confirmed_reservations ?? 0} / ${p.max_participants ?? '∞'}`,
    status: statusMap[p.status] || p.status,
    // raw fields for edit/delete (won't show in table since headers come from first object keys above)
    _raw: p,
  }))

  // strip _raw from table headers display by mapping to clean objects
  const tableDisplay = filteredData.map(p => ({
    id: p.id,
    naziv: p.name,
    destinacija: p.destination,
    datum: `${formatDate(p.start_date)} – ${formatDate(p.end_date)}`,
    cijena: `${p.base_price} ${p.currency || 'KM'}`,
    rezervacije: `${p.confirmed_reservations ?? 0} / ${p.max_participants ?? '∞'}`,
    status: statusMap[p.status] || p.status,
  }))

  // find raw program by id from row
  const getRawProgram = (row) => programs.find(p => p.id === row.id) || row

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    fetchPrograms()
  }

  const handleEditSuccess = () => {
    setEditProgram(null)
    fetchPrograms()
  }

  const handleDeleteSuccess = () => {
    setDeleteProgram(null)
    fetchPrograms()
  }

  return (
    <div className="programs-page-container">
      <PageHeader
        title="Programi"
        singular="program"
        onAdd={() => setShowCreateModal(true)}
      />

      <OneColumnSection>
        <FilterSelector
          filterWord="statusu"
          statusOptions={statusOptions}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          counts={counts}
        />
      </OneColumnSection>

      <OneColumnData>
        <Table
          content={tableDisplay}
          renderView={(row, onClose) => (
            <ProgramDetails programId={row.id} />
          )}
          renderEdit={(row, onClose) => {
            const raw = getRawProgram(row)
            return (
              <ProgramForm
                initialData={{ ...raw, status_raw: raw.status }}
                onSuccess={() => { onClose(); fetchPrograms() }}
                onCancel={onClose}
              />
            )
          }}
          renderDelete={(row, onClose) => {
            const raw = getRawProgram(row)
            return (
              <ProgramDelete
                program={raw}
                onSuccess={() => { onClose(); fetchPrograms() }}
                onCancel={onClose}
              />
            )
          }}
        />
      </OneColumnData>

      {showCreateModal && (
        <Modal title="Dodaj novi program" onClose={() => setShowCreateModal(false)}>
          <ProgramForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Programi
