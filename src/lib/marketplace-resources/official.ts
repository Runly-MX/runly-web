import { officialResourceMatches, officialResourceText } from './resource-official.js';
import type { ResourceSummary } from './types';

// Public pins mirror the Hub/ERP resource domain. Publisher metadata never adds keys.
export const RESOURCE_PINS = ['MCowBQYDK2VwAyEAlxpRLNpcPsac/Sex9+ElHGiPl/JXsD1U6xDmIQhTXqA='];
const canonical = (v: any): any => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k)=>[k,canonical(v[k])])) : v;
const bytes = (v: string) => new TextEncoder().encode(v);
const json = (v: unknown) => JSON.stringify(canonical(v));
const unbase64 = (v: string) => Uint8Array.from(atob(v),(c)=>c.charCodeAt(0));
const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer),(v)=>v.toString(16).padStart(2,'0')).join('');

export async function verifyOfficialResource(proof: any, resource: ResourceSummary, envelope: any, pins = RESOURCE_PINS, now = Date.now()): Promise<boolean> {
  try {
    if (!resource.latest || resource.availability !== 'available' || !officialResourceMatches(proof,{...resource,...resource.latest})) return false;
    const s = envelope?.signed;
    if (s?.schemaVersion !== 1 || s.catalog !== 'runly-resources-v1' || !Array.isArray(s.entries) || !Array.isArray(s.revocations)
      || !Number.isSafeInteger(s.sequence) || s.sequence < 1 || !Number.isFinite(Date.parse(s.generatedAt)) || !Number.isFinite(Date.parse(s.validUntil))
      || Date.parse(s.generatedAt) > now + 300000 || Date.parse(s.validUntil) < now || Date.parse(s.validUntil) <= Date.parse(s.generatedAt) || Date.parse(s.validUntil)-Date.parse(s.generatedAt) > 604800000) return false;
    const trusted = new Map<string,CryptoKey>();
    for (const pin of pins) {
      const raw = unbase64(pin);
      trusted.set(hex(await crypto.subtle.digest('SHA-256',raw)),await crypto.subtle.importKey('spki',raw,{name:'Ed25519'},false,['verify']));
    }
    const check = async (keyId: string, signature: string, message: string, at = s.generatedAt) => {
      const key = trusted.get(keyId);
      const announced = s.trust.keys.find((k: any)=>k.keyId === keyId);
      return !!key && !!announced && announced.state !== 'revoked' && !(announced.state === 'retired' && announced.until && Date.parse(at) > Date.parse(announced.until))
        && !s.revocations.some((r: any)=>r.type === 'key' && r.target.keyId === keyId)
        && crypto.subtle.verify('Ed25519',key,unbase64(signature),bytes(message));
    };
    const digest = hex(await crypto.subtle.digest('SHA-256',bytes(json(s))));
    let snapshotValid = false;
    for (const sig of envelope.signatures ?? []) if (await check(sig.keyId,sig.signature,`runly.catalog.resources.v1.snapshot\n${s.sequence}:${digest}`)) snapshotValid = true;
    if (!snapshotValid) return false;
    const e = s.entries.find((e: any)=>e.releaseId === resource.latest!.releaseId);
    if (!e || !e.listed || e.status !== 'published' || !officialResourceMatches(proof,e)) return false;
    if (!s.publishers.some((p: any)=>p.handle === e.publisher && p.state === 'active')
      || s.revocations.some((r: any)=>r.type === 'publisher' ? r.target.publisher === e.publisher : r.type === 'release' && r.target.resourceKey === e.resourceKey && r.target.version === e.version && r.target.sha256 === e.sha256)) return false;
    const keys = ['publisher','resourceKey','type','version','releaseId','sha256','size','access','license','locale','compatibility','requirements','provenance'];
    const statement = Object.fromEntries(keys.map((k)=>[k,e[k]]));
    return await check(e.keyId,e.signature,'runly.catalog.resources.v1.release\n'+json(statement),e.publishedAt)
      && await check(proof.keyId,proof.signature,officialResourceText(proof.statement),e.publishedAt);
  } catch { return false; }
}
