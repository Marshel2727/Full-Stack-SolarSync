'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartWrapperProps {
  type?: 'line' | 'bar' | 'area';
  data: ChartData<'line' | 'bar'>;
  title?: string;
  subtitle?: string;
  height?: number;
  options?: ChartOptions<'line' | 'bar'>;
  actionElement?: React.ReactNode;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  type = 'line',
  data,
  title,
  subtitle,
  height = 280,
  options,
  actionElement,
}) => {
  const defaultOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          font: {
            family: 'Plus Jakarta Sans',
            size: 12,
            weight: 500,
          },
          color: '#404944',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#022C22',
        titleFont: {
          family: 'Plus Jakarta Sans',
          size: 12,
          weight: 700,
        },
        bodyFont: {
          family: 'Inter',
          size: 12,
        },
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11,
          },
          color: '#64748B',
        },
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11,
          },
          color: '#64748B',
        },
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border border-surface-border shadow-sm">
      {(title || actionElement) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            {title && <h3 className="text-base font-bold text-slateText font-heading">{title}</h3>}
            {subtitle && <p className="text-xs text-slateText-muted mt-0.5">{subtitle}</p>}
          </div>
          {actionElement && <div className="flex items-center gap-2">{actionElement}</div>}
        </div>
      )}
      <div style={{ height: `${height}px` }} className="relative w-full">
        {type === 'bar' ? (
          <Bar data={data as ChartData<'bar'>} options={mergedOptions as ChartOptions<'bar'>} />
        ) : (
          <Line data={data as ChartData<'line'>} options={mergedOptions as ChartOptions<'line'>} />
        )}
      </div>
    </div>
  );
};
