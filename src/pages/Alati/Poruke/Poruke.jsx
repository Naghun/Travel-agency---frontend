import React, { useState, useEffect } from 'react'
import './Poruke.scss'
import OneColumnSection from '../../../features/OneColumnSection/OneColumnSection'
import PageHeader from '../../../features/PageHeader/PageHeader'
import OneColumnData from '../../../features/OneColumnData/OneColumnData'
import FilterSelector from '../../../components/Filters/FilterSelector/FilterSelector'
import Table from '../../../components/Table/Table'
import apiClient from '../../../api/apiClient.jsx'

const statusOptions = ["Sve", "Nepročitane", "Pročitane", "Poslane"]

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('bs-BA')
}

function Poruke() {
  const [poruke, setPoruke] = useState([])
  const [selectedStatus, setSelectedStatus] = useState("Sve")

  useEffect(() => {
    apiClient.get('/messages')
      .then(res => setPoruke(res.data))
      .catch(err => console.error('Error fetching messages:', err))
  }, [])

  const counts = statusOptions.reduce((acc, status) => {
    if (status === "Sve") acc[status] = poruke.length
    else if (status === "Nepročitane") acc[status] = poruke.filter(p => !p.read_at && !p.is_sent).length
    else if (status === "Pročitane") acc[status] = poruke.filter(p => p.read_at).length
    else acc[status] = poruke.filter(p => p.is_sent).length
    return acc
  }, {})

  const filteredData = selectedStatus === "Sve"
    ? poruke
    : poruke.filter(p => {
        if (selectedStatus === "Nepročitane") return !p.read_at && !p.is_sent
        if (selectedStatus === "Pročitane") return !!p.read_at
        return !!p.is_sent
      })

  const tableData = filteredData.map(p => ({
    id: p.id,
    od: p.sender?.name || p.from || '',
    do: p.recipient?.name || p.to || '',
    predmet: p.subject || p.title || '',
    datum: formatDate(p.created_at),
    status: p.is_sent ? 'Poslana' : p.read_at ? 'Pročitana' : 'Nepročitana',
  }))

  return (
    <div className="poruke-container">
      <PageHeader title="Poruke" singular="poruku" />
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
        <Table content={tableData} />
      </OneColumnData>
    </div>
  )
}

export default Poruke
