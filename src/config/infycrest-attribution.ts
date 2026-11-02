const parseEnabled = (value: string | undefined) => {
  if (value === undefined) return true;
  return !['0', 'false', 'no', 'off'].includes(value.trim().toLowerCase());
};

const configuredYear = Number.parseInt(
  process.env.INFYCREST_PROJECT_YEAR?.trim() || '',
  10
);

export const infycrestAttribution = {
  enabled: parseEnabled(process.env.INFYCREST_ATTRIBUTION_ENABLED),
  agencyName: process.env.INFYCREST_AGENCY_NAME?.trim() || 'InfyCrest Solutions',
  agencyWebsite:
    process.env.INFYCREST_AGENCY_WEBSITE?.trim() ||
    'https://www.infycrestsolutions.com/',
  projectName: process.env.INFYCREST_PROJECT_NAME?.trim() || 'Blue Coral Landing',
  projectYear:
    Number.isInteger(configuredYear) && configuredYear > 0
      ? configuredYear
      : 2026,
};
