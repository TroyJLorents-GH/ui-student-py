import React from 'react';
import { BarChart, LineChart, PieChart, RadarChart, ScatterChart } from '@mui/x-charts-pro';
import { FunnelChart } from '@mui/x-charts-pro/FunnelChart';
import { Heatmap } from '@mui/x-charts-pro/Heatmap';
import { legendClasses } from '@mui/x-charts/ChartsLegend';

// payload: { categories: string[], series: [{label, data:number[]}] }
const palette = ['#8c1d40', '#ffc627', '#5c6670', '#78be20', '#00a3e0', '#ff7f32', '#9e1b32', '#bfb800'];

// Bigger, semibold axis tick labels (instructor names, terms, courses) + legend labels.
const TICK = { fontSize: 13, fontWeight: 600 };
const legendSx = { [`& .${legendClasses.label}`]: { fontSize: 13, fontWeight: 600 } };

export function renderChart(type, payload, { height = 320 } = {}) {
  const { categories = [], series = [] } = payload || {};
  if (!categories.length || !series.length) return null;

  switch (type) {
    case 'line':
    case 'area':
      return (
        <LineChart height={height} colors={palette} sx={legendSx}
          xAxis={[{ scaleType: 'point', data: categories, tickLabelStyle: TICK }]}
          yAxis={[{ tickLabelStyle: TICK }]}
          series={series.map((s) => ({ label: s.label, data: s.data, area: type === 'area', showMark: false }))} />
      );
    case 'donut':
    case 'pie': {
      const s0 = series[0];
      return (
        <PieChart height={height} colors={palette} sx={legendSx}
          series={[{
            data: categories.map((c, i) => ({ id: c, value: s0.data[i], label: c })),
            innerRadius: type === 'donut' ? 60 : 0,
          }]} />
      );
    }
    case 'radar':
      return (
        <RadarChart height={height} colors={palette} sx={legendSx}
          radar={{ metrics: categories }}
          series={series.map((s) => ({ label: s.label, data: s.data }))} />
      );
    case 'scatter':
      return (
        <ScatterChart height={height} colors={palette} sx={legendSx}
          series={series.map((s) => ({
            label: s.label,
            data: s.data.map((v, i) => ({ x: i, y: v, id: `${s.label}-${i}` })),
          }))}
          xAxis={[{ data: categories.map((_, i) => i), tickLabelStyle: TICK }]}
          yAxis={[{ tickLabelStyle: TICK }]} />
      );
    case 'bar-horizontal':
      return (
        <BarChart layout="horizontal" colors={palette} sx={legendSx}
          height={Math.max(height, categories.length * 30 + 60)}
          xAxis={[{ tickLabelStyle: TICK }]}
          yAxis={[{ scaleType: 'band', data: categories, width: 210, tickLabelStyle: TICK }]}
          series={series.map((s) => ({ label: s.label, data: s.data }))} />
      );
    case 'bar-grouped':
      return (
        <BarChart height={height} colors={palette} sx={legendSx}
          xAxis={[{ scaleType: 'band', data: categories, tickLabelStyle: TICK }]}
          yAxis={[{ tickLabelStyle: TICK }]}
          series={series.map((s) => ({ label: s.label, data: s.data }))} />
      );
    case 'bar-stacked':
      return (
        <BarChart height={height} colors={palette} sx={legendSx}
          xAxis={[{ scaleType: 'band', data: categories, tickLabelStyle: TICK }]}
          yAxis={[{ tickLabelStyle: TICK }]}
          series={series.map((s) => ({ label: s.label, data: s.data, stack: 'total' }))} />
      );
    case 'funnel': {
      const s0 = series[0];
      return (
        <FunnelChart height={height} colors={palette}
          series={[{ data: categories.map((c, i) => ({ value: s0.data[i], label: c })) }]} />
      );
    }
    case 'heatmap': {
      // x = category index, y = series index, value = cell. Good for term × position
      // and course × term. Height grows with row count so labels stay readable.
      const data = [];
      let maxV = 0;
      series.forEach((s, yi) => s.data.forEach((v, xi) => { data.push([xi, yi, v]); if (v > maxV) maxV = v; }));
      return (
        <Heatmap height={Math.max(height, series.length * 26 + 80)}
          xAxis={[{ data: categories, tickLabelStyle: TICK, height: 32 }]}
          yAxis={[{ data: series.map((s) => s.label), width: 150, tickLabelStyle: TICK }]}
          zAxis={[{ colorMap: { type: 'continuous', min: 0, max: maxV || 1, color: ['#f7e1e8', '#8c1d40'] } }]}
          series={[{ data }]} />
      );
    }
    case 'bar':
    default:
      return (
        <BarChart height={height} colors={palette} sx={legendSx}
          xAxis={[{ scaleType: 'band', data: categories, tickLabelStyle: TICK }]}
          yAxis={[{ tickLabelStyle: TICK }]}
          series={series.map((s) => ({ label: s.label, data: s.data }))} />
      );
  }
}

export const TYPE_LABELS = {
  bar: 'Bar', 'bar-stacked': 'Stacked bar', 'bar-grouped': 'Grouped bar', 'bar-horizontal': 'Horizontal bar',
  line: 'Line', area: 'Area', pie: 'Pie', donut: 'Donut', radar: 'Radar', scatter: 'Scatter',
  funnel: 'Funnel', heatmap: 'Heatmap',
};
