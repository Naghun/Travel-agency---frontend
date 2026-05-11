import React, { useState, useEffect } from 'react'
import './Izvjestaji.scss'
import PageHeader from '../../../features/PageHeader/PageHeader'
import RecentUpcoming from '../../../features/RecentUpcoming/RecentUpcoming'
import MonthlyChart from '../../../components/Charts/MonthlyChart/MonthlyChart'
import Card from '../../../components/Card/Card'
import apiClient from '../../../api/apiClient.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlaneDeparture, faUsers, faClipboardList,
  faMoneyBill, faArrowTrendDown, faFileInvoice
} from '@fortawesome/free-solid-svg-icons'

function Izvjestaji() {
  const [stats, setStats] = useState([])

  useEffect(() => {
    apiClient.get('/dashboard/stats')
      .then(res => {
        const data = res.data
        setStats([
          { title: "Aktivni programi", value: data.activePrograms, icon: <FontAwesomeIcon icon={faPlaneDeparture} />, className: "programs" },
          { title: "Ukupno putnika", value: data.totalPassengers, icon: <FontAwesomeIcon icon={faUsers} />, className: "passengers" },
          { title: "Ukupno rezervacija", value: data.totalReservations, icon: <FontAwesomeIcon icon={faClipboardList} />, className: "reservations" },
          { title: "Ukupni prihodi", value: `${data.revenue} KM`, icon: <FontAwesomeIcon icon={faMoneyBill} />, className: "profit" },
          { title: "Ukupni rashodi", value: `${data.expenses} KM`, icon: <FontAwesomeIcon icon={faArrowTrendDown} />, className: "expenses" },
          { title: "Neplaćene fakture", value: `${data.unpaidInvoices} KM`, icon: <FontAwesomeIcon icon={faFileInvoice} />, className: "invoices" },
        ])
      })
      .catch(err => console.error('Error fetching stats:', err))
  }, [])

  return (
    <div className="izvjestaji-container">
      <PageHeader title="Izvještaji" singular="izvještaj" />
      <div className="stats-cards">
        {stats.map((s, i) => (
          <Card key={i} title={s.title} value={s.value} icon={s.icon} className={s.className} />
        ))}
      </div>
      <div className="charts-row">
        <div className="chart-box">
          <RecentUpcoming title="Mjesečni prihodi i rashodi">
            <MonthlyChart />
          </RecentUpcoming>
        </div>
        <div className="chart-box">
          <RecentUpcoming title="Pregled po programima">
            <MonthlyChart />
          </RecentUpcoming>
        </div>
      </div>
    </div>
  )
}

export default Izvjestaji
