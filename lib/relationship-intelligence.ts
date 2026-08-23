import { Member, Relationship, RelationshipPath, RelationshipPathStep } from './types';

type Edge = { to: string; kind: 'parent' | 'child' | 'spouse' };

function graph(relationships: Relationship[]) {
  const g = new Map<string, Edge[]>();
  const add = (a: string, b: string, kind: Edge['kind']) => g.set(a, [...(g.get(a) || []), { to: b, kind }]);
  for (const r of relationships) {
    if (r.relationship_type === 'spouse') { add(r.person_id, r.related_person_id, 'spouse'); add(r.related_person_id, r.person_id, 'spouse'); }
    else if (r.relationship_type === 'parent') { add(r.person_id, r.related_person_id, 'child'); add(r.related_person_id, r.person_id, 'parent'); }
    else { add(r.related_person_id, r.person_id, 'child'); add(r.person_id, r.related_person_id, 'parent'); }
  }
  return g;
}

export function findRelationshipPath(members: Member[], relationships: Relationship[], fromId: string, toId: string): RelationshipPath | null {
  const from = members.find(m => m.id === fromId), to = members.find(m => m.id === toId);
  if (!from || !to) return null;
  if (fromId === toId) return { from, to, memberIds: [fromId], steps: [], explanation: 'This is you.', distance: 0 };
  const g = graph(relationships);
  const queue = [fromId];
  const prev = new Map<string, { id: string; kind: Edge['kind'] } | null>([[fromId, null]]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current === toId) break;
    for (const e of g.get(current) || []) {
      if (prev.has(e.to)) continue;
      prev.set(e.to, { id: current, kind: e.kind });
      queue.push(e.to);
    }
  }
  if (!prev.has(toId)) return null;
  const ids: string[] = [];
  const kinds: Edge['kind'][] = [];
  let cur = toId;
  while (cur !== fromId) {
    ids.push(cur);
    const p = prev.get(cur)!;
    kinds.push(p ? p.kind : 'child');
    cur = p.id;
  }
  ids.push(fromId); ids.reverse(); kinds.reverse();
  const steps: RelationshipPathStep[] = ids.slice(1).map((id, i) => ({ memberId: id, relationship: relationshipWord(kinds[i]) }));
  const explanation = explainPath(members, ids, kinds);
  return { from, to, memberIds: ids, steps, explanation, distance: ids.length - 1 };
}

function relationshipWord(kind: Edge['kind']) { return kind === 'parent' ? 'parent' : kind === 'child' ? 'child' : 'spouse'; }

function explainPath(members: Member[], ids: string[], kinds: Edge['kind'][]): string {
  const target = members.find(m=>m.id===ids[ids.length-1]);
  if (kinds.length===1) return `${target?.full_name} is your ${relationshipWord(kinds[0])}.`;
  const names = ids.slice(1).map((id,i)=>`${members.find(m=>m.id===id)?.full_name} (${relationshipWord(kinds[i])})`);
  return `${target?.full_name} is connected to you through ${names.join(' → ')}.`;
}

function ancestorDepths(id: string, relationships: Relationship[]) {
  const depths = new Map<string, number>([[id,0]]);
  const queue=[id];
  while(queue.length){
    const current=queue.shift()!;
    const depth=depths.get(current)!;
    for(const r of relationships){
      const parent = r.relationship_type==='parent' ? (r.related_person_id===current ? r.person_id : null) : (r.relationship_type==='child' && r.person_id===current ? r.related_person_id : null);
      if(parent && !depths.has(parent)){ depths.set(parent,depth+1); queue.push(parent); }
    }
  }
  return depths;
}

export function explainKinship(members: Member[], relationships: Relationship[], fromId: string, toId: string): string | null {
  const from = members.find(m=>m.id===fromId), to = members.find(m=>m.id===toId);
  if (!from || !to) return null;
  if (fromId===toId) return 'This is the same person.';
  const a=ancestorDepths(fromId,relationships), b=ancestorDepths(toId,relationships);
  let best:{a:number;b:number}|null=null;
  for(const [ancestor,da] of a){
    const db=b.get(ancestor); if(db===undefined || da===0 || db===0) continue;
    if(!best || Math.max(da,db)<Math.max(best.a,best.b)) best={a:da,b:db};
  }
  if(!best) return null;
  if(best.a===1 && best.b===1) return `${to.full_name} is your sibling.`;
  if(best.a===1 && best.b>1) return `${to.full_name} is your ${best.b===2?'niece/nephew':'descendant through your child'}.`;
  if(best.b===1 && best.a>1) return `${to.full_name} is your ${best.a===2?'aunt/uncle':'ancestor through your parent'}.`;
  const degree=Math.max(1,Math.min(best.a,best.b)-1), removal=Math.abs(best.a-best.b);
  return `${to.full_name} is your ${ordinal(degree)} cousin${removal?` ${ordinal(removal)} removed`:''}.`;
}
function ordinal(n:number) { return n===1?'first':n===2?'second':n===3?'third':n===4?'fourth':`${n}th`; }

export function getCommonAncestors(members: Member[], relationships: Relationship[], aId: string, bId: string): Member[] {
  const depthsA=ancestorDepths(aId,relationships), depthsB=ancestorDepths(bId,relationships);
  return members.filter(m=>m.id!==aId&&m.id!==bId&&depthsA.has(m.id)&&depthsB.has(m.id)).sort((x,y)=>(depthsA.get(x.id)!+depthsB.get(x.id)!)-(depthsA.get(y.id)!+depthsB.get(y.id)!));
}

export function getCommonDescendants(members: Member[], relationships: Relationship[], aId: string, bId: string): Member[] {
  const descendants=(root:string)=>{const seen=new Set<string>();const q=[root];while(q.length){const id=q.shift()!;for(const r of relationships){const child=r.relationship_type==='parent'&&r.person_id===id?r.related_person_id:r.relationship_type==='child'&&r.related_person_id===id?r.person_id:null;if(child&&!seen.has(child)){seen.add(child);q.push(child)}}}return seen};
  const a=descendants(aId),b=descendants(bId); return members.filter(m=>a.has(m.id)&&b.has(m.id)).sort((x,y)=>x.generation_level-y.generation_level);
}

export function getStrictLineageIds(relationships: Relationship[], focusId: string): Set<string> {
  const keep = new Set<string>([focusId]);
  const parents = (id: string) => relationships.flatMap(r => {
    if (r.relationship_type === 'parent' && r.related_person_id === id) return [r.person_id];
    if (r.relationship_type === 'child' && r.person_id === id) return [r.related_person_id];
    return [];
  });
  const children = (id: string) => relationships.flatMap(r => {
    if (r.relationship_type === 'parent' && r.person_id === id) return [r.related_person_id];
    if (r.relationship_type === 'child' && r.related_person_id === id) return [r.person_id];
    return [];
  });
  const spouses = (id: string) => relationships
    .filter(r => r.relationship_type === 'spouse' && (r.person_id === id || r.related_person_id === id))
    .map(r => r.person_id === id ? r.related_person_id : r.person_id);

  let frontier = [focusId];
  while (frontier.length) {
    const next = frontier.flatMap(parents).filter(id => !keep.has(id));
    next.forEach(id => keep.add(id));
    frontier = next;
  }
  frontier = [focusId];
  while (frontier.length) {
    const next = frontier.flatMap(children).filter(id => !keep.has(id));
    next.forEach(id => keep.add(id));
    frontier = next;
  }
  spouses(focusId).forEach(id => keep.add(id));
  return keep;
}

function gendered(member: Member | undefined, male: string, female: string, neutral: string) {
  return member?.gender === 'Male' ? male : member?.gender === 'Female' ? female : neutral;
}

export function relationshipLabelToViewer(
  members: Member[],
  relationships: Relationship[],
  viewerId: string,
  targetId: string,
): string | null {
  if (viewerId === targetId) return 'You';
  const target = members.find(m => m.id === targetId);
  const path = findRelationshipPath(members, relationships, viewerId, targetId);
  if (!path || !target) return null;
  const kinds = path.steps.map(step => step.relationship);
  const key = kinds.join(',');
  if (key === 'parent') return gendered(target, 'Father', 'Mother', 'Parent');
  if (key === 'child') return gendered(target, 'Son', 'Daughter', 'Child');
  if (key === 'spouse') return gendered(target, 'Husband', 'Wife', 'Partner');
  if (key === 'parent,parent') return gendered(target, 'Grandfather', 'Grandmother', 'Grandparent');
  if (key === 'child,child') return gendered(target, 'Grandson', 'Granddaughter', 'Grandchild');
  if (key === 'parent,child') return gendered(target, 'Brother', 'Sister', 'Sibling');
  if (key === 'parent,parent,child') return gendered(target, 'Uncle', 'Aunt', 'Aunt / Uncle');
  if (key === 'parent,child,child') return gendered(target, 'Nephew', 'Niece', 'Niece / Nephew');
  if (key === 'parent,parent,child,child') return 'Cousin';

  const kinship = explainKinship(members, relationships, viewerId, targetId);
  if (kinship?.includes('cousin')) {
    const match = kinship.match(/your (.+?)\.$/i);
    return match?.[1]?.replace(/^./, c => c.toUpperCase()) || 'Cousin';
  }
  return path.distance <= 2 ? 'Close family' : 'Family relative';
}

export function immediateFamilyForViewer(
  members: Member[],
  relationships: Relationship[],
  viewerId: string,
): { member: Member; label: string }[] {
  const order: Record<string, number> = { Father: 1, Mother: 2, Husband: 3, Wife: 3, Partner: 3, Brother: 4, Sister: 4, Sibling: 4, Son: 5, Daughter: 5, Child: 5 };
  return members
    .filter(member => member.id !== viewerId)
    .map(member => ({ member, label: relationshipLabelToViewer(members, relationships, viewerId, member.id) || '' }))
    .filter(item => item.label in order)
    .sort((a, b) => (order[a.label] || 99) - (order[b.label] || 99) || a.member.full_name.localeCompare(b.member.full_name));
}

export function describeRelationshipToViewer(
  members: Member[],
  relationships: Relationship[],
  viewerId: string,
  targetId: string,
): string | null {
  const label = relationshipLabelToViewer(members, relationships, viewerId, targetId);
  const target = members.find(m => m.id === targetId);
  if (!label || !target) return null;
  if (label === 'You') return 'This is you.';
  if (label === 'Family relative' || label === 'Close family') {
    return explainKinship(members, relationships, viewerId, targetId) || findRelationshipPath(members, relationships, viewerId, targetId)?.explanation || null;
  }
  return `${target.full_name} is your ${label.toLowerCase()}.`;
}
