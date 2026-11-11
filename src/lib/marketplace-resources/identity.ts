import type { ResourceSummary } from './types';

// Institutional identity comes only from verified evidence. A registered
// publisher is not automatically the creator or the responsible organization.
export const resourceIdentity = (resource: ResourceSummary) => ({
  origin: resource.trust,
  publisher: resource.publisher,
  // Not present in the public projection yet: stays unknown, never guessed from the publisher.
  creator: null as { displayName: string } | null,
  contributors: [] as { displayName: string }[],
  organization: resource.trust === 'official' ? { name: 'Runly', basis: 'signed-institutional-attestation' } : null,
});
