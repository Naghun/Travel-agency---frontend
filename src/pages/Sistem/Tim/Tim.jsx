import React, { useState, useEffect } from 'react'
import './Tim.scss'
import OneColumnSection from '../../../features/OneColumnSection/OneColumnSection'
import PageHeader from '../../../features/PageHeader/PageHeader'
import OneColumnData from '../../../features/OneColumnData/OneColumnData'
import FilterSelector from '../../../components/Filters/FilterSelector/FilterSelector'
import Table from '../../../components/Table/Table'
import apiClient from '../../../api/apiClient.jsx'

const roleOptions = ["Svi", "Admin", "Menadžer", "Agent"]

function Tim() {
  const [tim, setTim] = useState([])
  const [selectedRole, setSelectedRole] = useState("Svi")

  useEffect(() => {
    apiClient.get('/users')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setTim(data)
      })
      .catch(err => console.error('Error fetching team:', err))
  }, [])

  const counts = roleOptions.reduce((acc, role) => {
    if (role === "Svi") acc[role] = tim.length
    else acc[role] = tim.filter(m => m.role === role.toLowerCase()).length
    return acc
  }, {})

  const filteredData = selectedRole === "Svi"
    ? tim
    : tim.filter(m => m.role === selectedRole.toLowerCase())

  const tableData = filteredData.map(m => ({
    id: m.id,
    ime: m.name,
    email: m.email,
    uloga: m.role || '',
    telefon: m.phone || '',
    status: m.active === false ? 'Neaktivan' : 'Aktivan',
  }))

  return (
    <div className="tim-container">
      <PageHeader title="Tim" singular="člana" />
      <OneColumnSection>
        <FilterSelector
          filterWord="ulozi"
          statusOptions={roleOptions}
          selectedStatus={selectedRole}
          setSelectedStatus={setSelectedRole}
          counts={counts}
        />
      </OneColumnSection>
      <OneColumnData>
        <Table content={tableData} />
      </OneColumnData>
    </div>
  )
}

export default Tim
