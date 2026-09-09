export class CommandError extends Error{constructor(public code:string,message:string,public status=400){super(message);this.name="CommandError"}}

type ExternalErrorShape={code?:unknown;message?:unknown;details?:unknown;hint?:unknown;status?:unknown};

function externalError(error:unknown):ExternalErrorShape{
 if(!error||typeof error!=="object")return {};
 return error as ExternalErrorShape;
}

export function normalizeCommandError(error:unknown){
 if(error instanceof CommandError)return error;
 const external=externalError(error);
 const code=typeof external.code==="string"?external.code:"";
 const message=error instanceof Error?error.message:typeof external.message==="string"?external.message:"Command failed.";
 const status=typeof external.status==="number"?external.status:undefined;

 // Supabase/PostgREST returns database errors as plain objects rather than Error instances.
 // Preserve their SQLSTATE/message so authorization and not-found failures keep their HTTP semantics.
 if(status===401||/jwt|auth|session|sign in/i.test(message))return new CommandError("UNAUTHENTICATED","Please sign in to continue.",401);
 if(status===403||code==="42501"||/permission|policy|rls|not allowed|forbidden|administrator access required/i.test(message))return new CommandError("FORBIDDEN","You do not have permission to perform this action.",403);
 if(status===404||code==="P0002"||/not found/i.test(message))return new CommandError("NOT_FOUND","The requested resource was not found.",404);
 if(status&&status>=400&&status<600)return new CommandError(code||"COMMAND_FAILED",message||"Command failed.",status);
 return new CommandError(code||"COMMAND_FAILED",message||"Command failed.",400);
}
