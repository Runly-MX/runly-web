import type { ResourceSummary } from './types';

// Institutional identity comes only from verified evidence. A registered
// publisher is not automatically the creator or the responsible organization.
export const resourceIdentity = (resource: ResourceSummary) => ({
  origin: resource.trust,
  publisher: resource.publisher,
  creator: null,
  contributors: [],
  organization: resource.trust === 'official' ? { name: 'Runly', basis: 'signed-institutional-attestation' } : null,
});
