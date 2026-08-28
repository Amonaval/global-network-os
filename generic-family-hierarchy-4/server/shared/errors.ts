export class CommandError extends Error{constructor(public code:string,message:string,public status=400){super(message);this.name="CommandError"}}
export function normalizeCommandError(error:unknown){
 if(error instanceof CommandError)return error;
 const message=error instanceof Error?error.message:"Command failed.";
 if(/jwt|auth|session|sign in/i.test(message))return new CommandError("UNAUTHENTICATED","Please sign in to continue.",401);
 if(/permission|policy|rls|not allowed|forbidden/i.test(message))return new CommandError("FORBIDDEN","You do not have permission to perform this action.",403);
 return new CommandError("COMMAND_FAILED",message||"Command failed.",400);
}
