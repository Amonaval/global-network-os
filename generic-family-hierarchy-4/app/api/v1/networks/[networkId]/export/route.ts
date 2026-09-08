import {createRequestContext} from "../../../../../../server/shared/request-context";
import {normalizeCommandError} from "../../../../../../server/shared/errors";
import {buildNetworkExport} from "../../../../../../server/network/export-service";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:{networkId:string}}){const requestId=request.headers.get("x-request-id")||crypto.randomUUID();try{const ctx=await createRequestContext(request);const data=await buildNetworkExport(ctx,params.networkId);return Response.json({ok:true,requestId,data})}catch(error){const e=normalizeCommandError(error);return Response.json({ok:false,requestId,error:{code:e.code,message:e.message}},{status:e.status})}}
