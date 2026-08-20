"use client";
import {useState} from 'react';
import {Database, FileUp, Sparkles, Trash2, TreePine} from 'lucide-react';
import ImportModal from './ImportModal';
import {Member,Relationship} from '../lib/types';
import {NetworkSettings, NETWORK_TEMPLATES} from '../lib/network';

type Props={onCreate:(settings:NetworkSettings,mode:'empty'|'demo'|'import',members?:Member[],relationships?:Relationship[])=>Promise<void>|void; shared:boolean; canSetup:boolean};
export default function SetupScreen({onCreate,shared,canSetup}:Props){
 const [name,setName]=useState(''); const [description,setDescription]=useState(''); const [busy,setBusy]=useState(false); const [showImport,setShowImport]=useState(false); const [error,setError]=useState('');
 const [selectedTemplate,setSelectedTemplate]=useState(NETWORK_TEMPLATES[0]);
 const create=async(mode:'empty'|'demo'|'import',members:Member[]=[],relationships:Relationship[]=[])=>{setError('');if(!name.trim()){setError('Enter a network name first.');return;}setBusy(true);try{await onCreate({id:'network',name:name.trim(),description,entity_label:selectedTemplate.entity_label,entity_label_plural:selectedTemplate.entity_label_plural,level_label:selectedTemplate.level_label,level_label_plural:selectedTemplate.level_label_plural,parent_label:selectedTemplate.parent_label,child_label:selectedTemplate.child_label,peer_label:selectedTemplate.peer_label,network_template:selectedTemplate.id},mode,members,relationships)}catch(e:any){setError(e.message||'Could not create the network.')}finally{setBusy(false)}};
 return <div className="landing"><div className="landing-card setup-card"><div className="brand-mark"><TreePine size={26}/></div><h1>Create your hierarchy network</h1><p className="page-subtitle">This app is generic. Use any name: Nawal Nandra Network, XYZ Network, a community, association, family, or any other hierarchy.</p>
 <div className="field"><label>Network name</label><input className="text-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Nawal Nandra Network" autoFocus/></div>
 <div className="field"><label>Description <span className="person-meta">optional</span></label><textarea className="text-input" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="What this network represents…"/></div>
 <h3>Network type</h3><p className="page-subtitle">Choose the vocabulary that fits your network. Labels can be customised further after setup.</p>
 <div className="setup-options">{NETWORK_TEMPLATES.map(t=><button key={t.id} className={`setup-option${selectedTemplate.id===t.id?' selected':''}`} onClick={()=>setSelectedTemplate(t)}><strong>{t.name}</strong><span>{t.description}</span><span className="person-meta" style={{marginTop:4}}>{t.entity_label} · {t.level_label} · {t.parent_label} / {t.child_label}</span></button>)}</div>
 <h3>Choose starting data</h3><p className="page-subtitle">Nothing is generated automatically. Pick exactly how you want to start.</p>
 <div className="setup-options"><button className="setup-option" disabled={busy||!canSetup} onClick={()=>create('empty')}><Trash2/><strong>Start Empty</strong><span>Create the network with no {selectedTemplate.entity_label_plural.toLowerCase()}.</span></button><button className="setup-option" disabled={busy||!canSetup} onClick={()=>create('demo')}><Sparkles/><strong>Load 150-member Demo</strong><span>Six generations with siblings, spouses, locations and deceased members.</span></button><button className="setup-option" disabled={busy||!canSetup} onClick={()=>setShowImport(true)}><FileUp/><strong>Import CSV / XLSX / XML</strong><span>Validate and load your own hierarchy.</span></button></div>
 {shared&&!canSetup&&<div className="notice"><Database size={15}/> Only an administrator can initialize the shared network.</div>}{error&&<div className="notice danger-text">{error}</div>}
 <div className="setup-help">After setup, the network name is stored with the application and the data becomes the shared hierarchy in Supabase.</div></div>{showImport&&<ImportModal onClose={()=>setShowImport(false)} onImport={(m,r)=>{setShowImport(false);create('import',m,r)}}/>}</div>
}
