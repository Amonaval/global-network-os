export const VERTICALS=[
 {kind:'family',label:'Family',specific:['family tree','relationships','claiming','memories']},
 {kind:'alumni',label:'Alumni',specific:['alumni directory','cohorts','connections']},
 {kind:'housing-society',label:'Housing Society',specific:['buildings','units','residents','occupancy','vehicles','parking','notices','complaints','maintenance','governance','security']},
 {kind:'family-association',label:'Family Association',specific:['families','people','representative','membership','renewal']},
 {kind:'association',label:'Association',specific:['members','groups','roles','events']},
 {kind:'organization',label:'Organization',specific:['people','teams','projects','skills']},
 {kind:'business-trust',label:'Business Trust',specific:['businesses','contacts','categories','trust relationships']},
 {kind:'franchise',label:'Franchise',specific:['branches','operators','geography']},
 {kind:'professional',label:'Professional',specific:['professionals','expertise','affiliations']}
] as const;
export type VerticalKind=typeof VERTICALS[number]['kind'];
export const ACTORS=['owner','admin','member','invitee','anonymous'] as const;
export const SHARED_TOP_FLOWS=['create/open network','choose how to start','quick start','guided workbook','admin center','invitations','guide','whats new','network health','backup/export','archive/restore','hard delete'] as const;
