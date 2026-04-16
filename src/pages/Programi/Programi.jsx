import React, { useState } from 'react'
import './Programi.scss'
import OneColumnSection from '../../features/OneColumnSection/OneColumnSection';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";

import PageHeader from '../../features/PageHeader/PageHeader';
import OneColumnData from '../../features/OneColumnData/OneColumnData';
import FilterSelector from '../../components/Filters/FilterSelector/FilterSelector';
import Table from '../../components/Table/Table';

// primjer dataset-a
const data = [
  { naziv: "Putovanje u Rim", destinacija: "Rim", datum: "2026-03-11 – 2026-03-20", cijena: "KM 2,200.00", rezervacije: "3 / 10", status: "Planirano" },
  { naziv: "Seminar u Sarajevu", destinacija: "Sarajevo", datum: "2026-04-01 – 2026-04-03", cijena: "KM 500.00", rezervacije: "10 / 10", status: "Aktivno" },
  { naziv: "Ljetovanje u Neumu", destinacija: "Neum", datum: "2026-07-15 – 2026-07-25", cijena: "KM 1,800.00", rezervacije: "0 / 5", status: "Odgođeno" },
  { naziv: "Konferencija u Berlinu", destinacija: "Berlin", datum: "2026-05-10 – 2026-05-12", cijena: "KM 3,500.00", rezervacije: "5 / 5", status: "Završeno" },
  { naziv: "Festival u Mostaru", destinacija: "Mostar", datum: "2026-06-01 – 2026-06-05", cijena: "KM 750.00", rezervacije: "2 / 8", status: "Otkazano" },
];

const statusOptions = ["Svi", "Aktivno", "Planirano", "Završeno", "Odgođeno", "Otkazano"];

const counts = statusOptions.reduce((acc, status) => {
  if (status === "Svi") {
    acc[status] = data.length;
  } else {
    acc[status] = data.filter(item => item.status.toLowerCase() === status.toLowerCase()).length;
  }
  return acc;
}, {});


function Programi() {
  const [selectedStatus, setSelectedStatus] = useState("Svi");

  const filteredData = selectedStatus === "Svi"
    ? data
    : data.filter(item => item.status.toLowerCase() === selectedStatus.toLowerCase());

  return (
    <div className='programs-page-container'>
      <PageHeader title="Programi" singular="program"/>
      
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
        <Table content={filteredData} />
      </OneColumnData>

    </div>
  )
}

export default Programi;
