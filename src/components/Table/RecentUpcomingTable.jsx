import React from 'react';
import './RecentUpcomingTable.scss';

function RecentUpcomingTable() {
  const data = [
    { id: 1, name: "Program A", date: "2026-04-10", status: "Aktivan" },
    { id: 2, name: "Program B", date: "2026-04-12", status: "Završeno" },
    { id: 3, name: "Program C", date: "2026-04-13", status: "Na čekanju" },
    { id: 4, name: "Program D", date: "2026-04-13", status: "Na čekanju" },
    { id: 5, name: "Program E", date: "2026-04-13", status: "Na čekanju" },
    { id: 6, name: "Program F", date: "2026-04-13", status: "Na čekanju" },
  ];

  return (
    <div className="recent-upcoming-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Naziv</th>
            <th>Datum</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.date}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentUpcomingTable;
