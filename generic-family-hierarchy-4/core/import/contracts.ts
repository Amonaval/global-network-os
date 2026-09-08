import type {NetworkVerticalKind} from "../verticals/contracts";

export type ImportColumnType="text"|"number"|"date"|"boolean"|"email"|"enum"|"reference";
export type ImportColumnTarget=`label`|`metadata.${string}`|`affiliation.${string}`|`stableId`|`fromRef`|`toRef`|`relationshipType`|`ignore`;
export type ImportColumnSchema={
 key:string;label:string;type:ImportColumnType;required?:boolean;description:string;example?:string|number|boolean;acceptedValues?:readonly string[];target:ImportColumnTarget;referenceSheet?:string;referenceSheets?:readonly string[];privacyNote?:string;aliases?:readonly string[];
};
export type ImportSheetSchema={
 key:string;name:string;description:string;required?:boolean;recordType:"entity"|"relationship"|"domain";entityKind?:string;columns:readonly ImportColumnSchema[];sampleRows:readonly Record<string,unknown>[];
};
export type ImportSchema={
 verticalKind:NetworkVerticalKind;version:string;title:string;description:string;privacyNotes:readonly string[];duplicatePolicy:string;sheets:readonly ImportSheetSchema[];
};
export type ImportIssueSeverity="error"|"warning";
export type ImportIssue={severity:ImportIssueSeverity;code:string;message:string;sheet?:string;row?:number;column?:string};
export type ParsedImportRow={sheetKey:string;sheetName:string;rowNumber:number;values:Record<string,unknown>;raw:Record<string,unknown>;status:"valid"|"warning"|"rejected";issues:ImportIssue[]};
export type ParsedImportSheet={schema:ImportSheetSchema;rows:ParsedImportRow[];validRows:number;warningRows:number;rejectedRows:number};
export type ImportReview={schema:ImportSchema;fileName:string;issues:ImportIssue[];sheets:ParsedImportSheet[];validRows:number;warningRows:number;rejectedRows:number;canCommit:boolean};
export type ImportCommitResult={created:number;updated:number;relationships:number;skipped:number;message:string};
