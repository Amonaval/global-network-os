import {createRequestContext} from "../../../../../../server/shared/request-context";
import {normalizeCommandError} from "../../../../../../server/shared/errors";
import {purgeOwnedNetwork} from "../../../../../../server/network/purge-service";

export const runtime="nodejs";

export async function POST(request:Request,{params}:{params:{networkId:string}}){
 const requestId=request.headers.get("x-request-id")||crypto.randomUUID();
 try{
  const body=await request.json().catch(()=>({})) as {confirmName?:unknown};
  const confirmName=typeof body.confirmName==="string"?body.confirmName:"";
  const ctx=await createRequestContext(request);
  const data=await purgeOwnedNetwork(ctx,params.networkId,confirmName);
  return Response.json({ok:true,requestId,data});
 }catch(error){
  const e=normalizeCommandError(error);
  return Response.json({ok:false,requestId,error:{code:e.code,message:e.message}},{status:e.status});
 }
}
