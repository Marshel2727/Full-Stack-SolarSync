// Formatter utilities for SolarSync

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatKwh = (kwh: number): string => {
  if (kwh >= 1000) {
    return `${formatNumber(kwh / 1000, 2)} MWh`;
  }
  return `${formatNumber(kwh, 1)} kWh`;
};

export const formatKwp = (kwp: number): string => {
  return `${formatNumber(kwp, 2)} kWp`;
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatPercent = (val: number): string => {
  return `${Math.round(val)}%`;
};
