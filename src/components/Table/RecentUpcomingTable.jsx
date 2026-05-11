import React, { useEffect, useState } from 'react';
import './RecentUpcomingTable.scss';
import apiClient from "../../api/apiClient.jsx"; // koristi tvoj axios client

function RecentUpcomingTable() {
  const [programStats, setProgramStats] = useState([]);

  useEffect(() => {
    const fetchProgramStats = async () => {
      try {
        const response = await apiClient.get("/dashboard/program-stats");
        setProgramStats(response.data);
      } catch (error) {
        console.error("Error fetching program stats:", error);
      }
    };

    fetchProgramStats();
  }, []);

  // map status API -> prevedeni nazivi
  const statusMap = {
    planned: "Planirano",
    active: "Aktivno",
    completed: "Završeno",
    postponed: "Odgođeno",
    cancelled: "Otkazano"
  };

  // format datuma: day/month – day/month – year
  const formatDateRange = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);

    const dayMonthStart = `${s.getDate()}/${s.getMonth() + 1}`;
    const dayMonthEnd = `${e.getDate()}/${e.getMonth() + 1}`;
    const year = e.getFullYear();

    return `${dayMonthStart} – ${dayMonthEnd}  ${year}`;
  };

  return (
    <div className="recent-upcoming-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Naziv</th>
            <th>Destinacija</th>
            <th>Datum</th>
            <th>Status</th>
            <th>Rezervacije</th>
          </tr>
        </thead>
        <tbody>
          {programStats.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.destination}</td>
              <td>{formatDateRange(item.start_date, item.end_date)}</td>
              <td>{statusMap[item.status] || item.status}</td>
              <td>{`${item.confirmed_count} / ${item.reservations_count}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentUpcomingTable;
