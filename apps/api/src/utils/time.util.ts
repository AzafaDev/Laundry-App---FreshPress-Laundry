export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export function toWIBView(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET_MS);
}

export function wibTimeOnDate(wibView: Date, hour: number, minute: number, second: number): Date {
  return new Date(
    Date.UTC(wibView.getUTCFullYear(), wibView.getUTCMonth(), wibView.getUTCDate(), hour, minute, second) - WIB_OFFSET_MS
  );
}

export function getNow(): Date {
  if (process.env.MOCK_NOW) return new Date(process.env.MOCK_NOW);
  return new Date();
}

export function getTodayLocalStart(): Date {
  const wib = toWIBView(getNow());
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()));
}

export function toLocalMidnight(date: Date): Date {
  const wib = toWIBView(date);
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()));
}
