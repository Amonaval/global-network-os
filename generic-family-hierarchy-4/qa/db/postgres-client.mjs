/**
 * PostgreSQL access for QA certification without requiring a locally installed psql binary.
 * The `pg` package is installed project-locally by `npm run qa:setup` using --no-save.
 */
let pgModulePromise;

async function loadPg(){
  if(!pgModulePromise){
    pgModulePromise=import('pg').catch((error)=>{
      const wrapped=new Error('Node PostgreSQL driver `pg` is not installed. Run `npm run qa:setup` once, then retry the QA command. No local PostgreSQL server or admin installation is required.');
      wrapped.cause=error;
      throw wrapped;
    });
  }
  return pgModulePromise;
}

export function validatePostgresUrl(value,label='PostgreSQL URL'){
  if(!value)return null;
  let parsed;
  try{parsed=new URL(value)}catch{throw new Error(`${label} must be a PostgreSQL connection URL`)}
  if(!['postgres:','postgresql:'].includes(parsed.protocol))throw new Error(`${label} must start with postgres:// or postgresql://`);
  return parsed;
}

export async function withPgClient(connectionString,fn,{applicationName='trustweave-qa'}={}){
  const parsed=validatePostgresUrl(connectionString);
  const {Client}=await loadPg();
  const client=new Client({
    connectionString,
    application_name:applicationName,
    connectionTimeoutMillis:15000,
    query_timeout:120000,
    statement_timeout:120000,
  });
  try{
    await client.connect();
    return await fn(client,parsed);
  }finally{
    try{await client.end()}catch{/* best-effort close */}
  }
}

export async function queryRows(connectionString,text,values=[]){
  return withPgClient(connectionString,async(client)=>{
    const result=await client.query(text,values);
    return result.rows;
  });
}

export async function queryScalar(connectionString,text,values=[]){
  const rows=await queryRows(connectionString,text,values);
  if(!rows.length)return '';
  const first=rows[0];
  const key=Object.keys(first)[0];
  const value=first[key];
  if(value===null||value===undefined)return '';
  return typeof value==='object'?JSON.stringify(value):String(value);
}

export async function executeSql(connectionString,text){
  return withPgClient(connectionString,async(client)=>client.query(text),{applicationName:'trustweave-qa-migration'});
}
