import {CommandError} from "./errors";
import {objectBody} from "./validation";

export type RequestSafetyOptions={maxBodyBytes?:number;requireJson?:boolean};

export async function readJsonObject(request:Request,options:RequestSafetyOptions={}):Promise<Record<string,unknown>>{
 const maxBodyBytes=options.maxBodyBytes??256_000;
 const requireJson=options.requireJson!==false;
 const contentType=request.headers.get("content-type")||"";
 if(requireJson&&!contentType.toLowerCase().includes("application/json"))throw new CommandError("UNSUPPORTED_MEDIA_TYPE","Content-Type must be application/json.",415);
 const declared=Number(request.headers.get("content-length")||0);
 if(Number.isFinite(declared)&&declared>maxBodyBytes)throw new CommandError("PAYLOAD_TOO_LARGE",`Request body exceeds ${maxBodyBytes} bytes.`,413);
 if(!request.body)return objectBody({});
 const reader=request.body.getReader();
 const decoder=new TextDecoder();
 let total=0,text="";
 while(true){
  const {done,value}=await reader.read();if(done)break;
  total+=value.byteLength;if(total>maxBodyBytes){try{await reader.cancel()}catch{}throw new CommandError("PAYLOAD_TOO_LARGE",`Request body exceeds ${maxBodyBytes} bytes.`,413)}
  text+=decoder.decode(value,{stream:true});
 }
 text+=decoder.decode();
 let parsed:unknown;
 try{parsed=text?JSON.parse(text):{}}catch{throw new CommandError("INVALID_JSON","Request body must contain valid JSON.",400)}
 return objectBody(parsed);
}
