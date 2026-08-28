import {CommandError} from "./errors";
export function objectBody(value:unknown):Record<string,unknown>{if(!value||typeof value!=="object"||Array.isArray(value))throw new CommandError("INVALID_BODY","Request body must be a JSON object.");return value as Record<string,unknown>}
export function text(value:unknown,name:string,max=200){const s=typeof value==="string"?value.trim():"";if(!s)throw new CommandError("INVALID_INPUT",`${name} is required.`);if(s.length>max)throw new CommandError("INVALID_INPUT",`${name} is too long.`);return s}
export function optionalText(value:unknown,max=1000){if(value==null)return undefined;if(typeof value!=="string")throw new CommandError("INVALID_INPUT","Invalid text value.");const s=value.trim();if(s.length>max)throw new CommandError("INVALID_INPUT","Text value is too long.");return s||undefined}

export function booleanValue(value:unknown,name:string){if(typeof value!=="boolean")throw new CommandError("INVALID_INPUT",`${name} must be true or false.`);return value}
