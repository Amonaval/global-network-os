import type {NetworkAffiliatedEntity,NetworkProjectionDefinition,ProjectionNode} from "../../core/network-os/contracts";

function normalizedValues(entity:NetworkAffiliatedEntity,key:string){return (entity.affiliations[key]||[]).map(v=>String(v).trim()).filter(Boolean)}

export function buildProjectionTree(entities:readonly NetworkAffiliatedEntity[],projection:NetworkProjectionDefinition):ProjectionNode[]{
 const make=(subset:readonly NetworkAffiliatedEntity[],depth:number,path:string):ProjectionNode[]=>{
  const levelKey=projection.levels[depth]; if(!levelKey)return [];
  const groups=new Map<string,NetworkAffiliatedEntity[]>();
  for(const entity of subset){
   const values=normalizedValues(entity,levelKey);
   for(const value of values.length?values:["Not specified"]){const list=groups.get(value)||[];list.push(entity);groups.set(value,list)}
  }
  return [...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true})).map(([label,items])=>({
   key:`${path}/${levelKey}:${label}`,
   label,
   levelKey,
   depth,
   entityCount:new Set(items.map(x=>x.entity.id)).size,
   entityIds:[...new Set(items.map(x=>x.entity.id))],
   children:depth+1<projection.levels.length?make(items,depth+1,`${path}/${levelKey}:${label}`):[]
  }));
 };
 return make(entities,0,projection.key);
}

export function filterEntitiesByProjectionPath(entities:readonly NetworkAffiliatedEntity[],path:readonly {levelKey:string;label:string}[]){
 return entities.filter(entity=>path.every(step=>(entity.affiliations[step.levelKey]||[]).includes(step.label)));
}

export function projectionPathLabel(path:readonly {label:string}[]){return path.map(x=>x.label).join(" → ")}
