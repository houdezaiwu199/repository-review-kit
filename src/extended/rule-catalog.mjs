export const ruleCatalogue = Object.freeze([
  ['private-key','credential','Private key header'], ['github-token','credential','GitHub credential shape'], ['cloud-access-key','credential','Cloud access identifier'], ['credential-url','credential','Password-bearing URL'], ['assigned-secret','review','Literal credential assignment'], ['email-address','privacy','Contact address'], ['mainland-phone','privacy','Telephone number shape']
].map(([id,severity,description]) => Object.freeze({ id,severity,description })));
export function selectRules(ids) { if (!Array.isArray(ids) || new Set(ids).size !== ids.length) throw new Error('Rule IDs must be unique.'); return ids.map(id => { const rule = ruleCatalogue.find(r => r.id === id); if (!rule) throw new Error('Unknown rule ID.'); return rule; }); }
