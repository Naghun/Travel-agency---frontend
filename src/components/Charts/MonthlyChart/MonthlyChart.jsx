import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

function MonthlyChart() {
  const dataset = [
    { month: 'Januar', Prihodi: 1200, Rashodi: 320 },
    { month: 'Februar', Prihodi: 1500, Rashodi: 400 },
    { month: 'Mart', Prihodi: 1800, Rashodi: 900 },
    { month: 'April', Prihodi: 1200, Rashodi: 300 },
    { month: 'Maj', Prihodi: 800, Rashodi: 1500 },
  ];

  const chartSetting = {
    height: 307,
    series: [
      { dataKey: 'Prihodi', label: 'Prihodi', color: '#4caf50' },
      { dataKey: 'Rashodi', label: 'Rashodi', color: '#e74c3c' },
    ],
  };

  return (
    <div>
      <BarChart
        dataset={dataset}
        xAxis={[{ dataKey: 'month' }]}
        {...chartSetting}
      />

      {/* Static total prikaz */}
      {/* <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
        Ukupno: 5000
      </div> */}
    </div>
  );
}

export default MonthlyChart;
