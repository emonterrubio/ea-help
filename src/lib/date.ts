const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Formats an epoch-milliseconds value as `MM/DD/YYYY, hh:mm:ss AM`. */
export const formatTimestamp = (epochMs: number | string): string => timestampFormatter.format(Number(epochMs));
