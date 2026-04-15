import React from 'react';
import './OverallChart.scss'
import { BarChart } from '@mui/x-charts/BarChart';

function OverallChart() {
  const dataset = [
    { label: '', Prihodi: 3500, Rashodi: 2220, Total: 1280 },
  ];

  return (
    <div>
      <BarChart className="chart"
         dataset={dataset}
        layout="horizontal"
        height={300}
        series={[
          { dataKey: 'Prihodi', label: 'Prihodi', color: '#2196f3' }, // plava
          { dataKey: 'Rashodi', label: 'Rashodi', color: '#e74c3c' }, // crvena
          { dataKey: 'Total', label: 'Total', color: '#4caf50' },     // zelena
        ]}
        xAxis={[
          {
            label: 'Vrijednost u KM',
            min: 0,
            max: 4000,
            ticks: [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000],
            valueFormatter: (v) => `${v}`,
          },
        ]}
        yAxis={[
          {
            dataKey: 'label',
            labelStyle: { fontSize: 14, fontWeight: 'bold' },
            tickLabelStyle: { fontSize: 12 },
          },
        ]}
        barLabel="value" // prikazuje vrijednost na samom baru
        categoryGapRatio={0.4} // više prostora za tekst
      />
    </div>
  );
}

export default OverallChart;