import { it, expect } from 'vitest';
import { generateKeyPairSync, createHash, randomUUID, sign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { verifyOfficialResource } from '../official';
import { officialResourceText } from '../resource-official.js';
import { parseResourceSummary } from '../parse';

const canonical = (v: any): any => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k)=>[k,canonical(v[k])])) : v;
const json = (v: any) => JSON.stringify(canonical(v));
const sha = (v: string | Buffer) => createHash('sha256').update(v).digest('hex');
it('Web requires pinned attestation, release and snapshot signatures; metadata never promotes trust',async()=>{
  const {privateKey,publicKey} = generateKeyPairSync('ed25519');
  const pin = publicKey.export({format:'der',type:'spki'}).toString('base64'),keyId = sha(Buffer.from(pin,'base64'));
  const vectors = JSON.parse(readFileSync(new URL('../../../../../runly/apps/api/src/services/catalog/__tests__/fixtures/resource-feed-v1.vectors.json',import.meta.url),'utf8'));
  const original = structuredClone(vectors.snapshot1.envelope);
  expect(original).toBeTruthy();
  const e = original.signed.entries.find((e: any)=>e.type === 'studio_template');
  original.signed.entries = [e];
  original.signed.trust.keys = [{keyId,publicKey:pin,role:'resource',state:'active',since:original.signed.generatedAt,until:null,reason:null}];
  const signature = (text: string) => sign(null,Buffer.from(text),privateKey).toString('base64');
  const statement = {schemaVersion:1,issuer:'runly',channel:'institutional',authorityId:randomUUID(),organizationId:randomUUID(),publisherId:randomUUID(),publisher:e.publisher,
    grantedBySha256:'1'.repeat(64),reviewerSha256:'2'.repeat(64),requesterSha256:'3'.repeat(64),reviewId:randomUUID(),draftRevision:2,fileId:randomUUID(),
    evidenceSha256:e.provenance.evidenceSha256,validatorId:e.provenance.validatorId,resourceKey:e.resourceKey,type:e.type,version:e.version,releaseId:e.releaseId,sha256:e.sha256,decidedAt:original.signed.generatedAt};
  const proof = {statement,keyId,signature:signature(officialResourceText(statement))};
  e.keyId=keyId;
  const fields=['publisher','resourceKey','type','version','releaseId','sha256','size','access','license','locale','compatibility','requirements','provenance'];
  e.signature=signature('runly.catalog.resources.v1.release\n'+json(Object.fromEntries(fields.map((k)=>[k,e[k]]))));
  const resign=()=>{original.signatures=[{keyId,signature:signature(`runly.catalog.resources.v1.snapshot\n${original.signed.sequence}:${sha(json(original.signed))}`)}];};resign();
  const resource:any={resourceKey:e.resourceKey,type:e.type,publisher:{handle:e.publisher,displayName:'Publisher',verified:false},availability:'available',latest:{...e}};
  const now=Date.parse(original.signed.generatedAt)+1000;
  expect(await verifyOfficialResource(proof,resource,original,[pin],now)).toBe(true);
  expect(await verifyOfficialResource(proof,resource,original,[],now)).toBe(false);
  const changed=structuredClone(proof);changed.statement.organizationId=randomUUID();
  expect(await verifyOfficialResource(changed,resource,original,[pin],now)).toBe(false);
  e.status='withdrawn';resign();
  expect(await verifyOfficialResource(proof,resource,original,[pin],now)).toBe(false);
  e.status='published';original.signed.revocations.push({type:'release',target:{resourceKey:e.resourceKey,version:e.version,sha256:e.sha256}});resign();
  expect(await verifyOfficialResource(proof,resource,original,[pin],now)).toBe(false);
  const parsed=parseResourceSummary({...resource,slug:e.resourceKey.slice(7),title:e.title,summary:'Example',trust:'official',listed:true,indexable:true,license:e.license,locale:'es',updatedAt:e.publishedAt,previews:[]});
  expect(parsed?.trust).toBe('community');
});
