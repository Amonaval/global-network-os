import type {BackgroundJob,BackgroundJobReceipt} from "./contracts";
import {CommandError} from "../shared/errors";

// M5 establishes the seam only. Do not pretend post-response work is durable on serverless.
export async function dispatchBackgroundJob(_job:BackgroundJob):Promise<BackgroundJobReceipt>{
 throw new CommandError("BACKGROUND_RUNTIME_NOT_CONFIGURED","Background processing is not configured for this deployment.",503);
}
export async function runBoundedInlineJob<T>(work:()=>Promise<T>):Promise<T>{return work()}
