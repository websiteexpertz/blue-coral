import { infycrestAttribution } from '@/config/infycrest-attribution';

export default function AgencyAttribution() {
  if (!infycrestAttribution.enabled) return null;

  const sourceComment = `<!--
Website Development Agency: ${infycrestAttribution.agencyName}
Website: ${infycrestAttribution.agencyWebsite}
Year: ${infycrestAttribution.projectYear}
-->`;

  return (
    <div
      aria-hidden="true"
      className="hidden"
      dangerouslySetInnerHTML={{ __html: sourceComment }}
    />
  );
}
