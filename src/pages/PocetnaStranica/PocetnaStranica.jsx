import React from "react";
import './PocetnaStranica.scss'
import Card from "../../components/Card/Card.jsx";
import RecentUpcoming from "../../features/RecentUpcoming/RecentUpcoming.jsx";
import RecentUpcomingTable from "../../components/Table/RecentUpcomingTable.jsx";
import MonthlyChart from "../../components/Charts/MonthlyChart/MonthlyChart.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faMoneyBill, faFileInvoice, faPlaneDeparture, faClipboardList, faArrowTrendDown } from "@fortawesome/free-solid-svg-icons";

function PocetnaStranica() {
  const stats = [
    { title: "Aktivni programi", value: 1, icon: <FontAwesomeIcon icon={faPlaneDeparture} />, className: "programs" },
    { title: "Ukupno putnika", value: 0, icon: <FontAwesomeIcon icon={faUsers} />, className: "passengers" },
    { title: "Ukupno rezervacija", value: 0, icon: <FontAwesomeIcon icon={faClipboardList} />, className: "reservations" },
    { title: "Ukupni prihodi", value: "40.00KM", icon: <FontAwesomeIcon icon={faMoneyBill} />, className: "profit" },
    { title: "Ukupni rashodi", value: "30.00KM", icon: <FontAwesomeIcon icon={faArrowTrendDown} />, className: "expenses" },
    { title: "Neplaćene fakture", value: "20.00KM", icon: <FontAwesomeIcon icon={faFileInvoice} />, className: "invoices" },
  ];


  return (
    <div className="dashboard-container">
      <div className="top-container">
        {stats.map((s, i) => (
          <Card key={i} title={s.title} value={s.value} icon={s.icon} className={s.className} />
        ))}
      </div>
      <div className="recent-upcoming-container">
        <div className="recent-container">
          <RecentUpcoming title="Nadolazeći programi" showButton={true}>
            <RecentUpcomingTable />
          </RecentUpcoming>
        </div>
        <div className="upcoming-container">
          <RecentUpcoming title="Nedavne rezervacije" showButton={true}>
            <RecentUpcomingTable />
          </RecentUpcoming>
        </div>
      </div>
      <div className="monthly-stats-container">
        <div className="monthly-container">
          <RecentUpcoming title="Mjesečni podaci">
            <MonthlyChart />
          </RecentUpcoming>
        </div>
        <div className="stats-container">
          <RecentUpcoming title="Statusi rezervacija" showButton={true}>
            <RecentUpcomingTable />
          </RecentUpcoming>
        </div>
      </div>
    </div>
  );
}

export default PocetnaStranica;
