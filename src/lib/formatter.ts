const NUMBER_FORMATTER = new Intl.NumberFormat();

export const formatNumber = (n?: number) =>
  n !== undefined ? NUMBER_FORMATTER.format(n) : 'NaN';
