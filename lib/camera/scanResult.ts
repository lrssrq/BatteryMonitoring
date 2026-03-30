let latestScannedData: string | null = null;

export function setLatestScannedData(value: string | null) {
  latestScannedData = value;
}

export function getLatestScannedData() {
  return latestScannedData;
}

export function consumeLatestScannedData() {
  const value = latestScannedData;
  latestScannedData = null;
  return value;
}
