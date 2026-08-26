import type { ConstructionEdgeInput, ConstructionEntityInput, ConstructionSubmission } from "../../../core/construction/contracts";

/** Non-kinship second-consumer evidence for the shared construction abstraction. */
export type AlumniConstructionEntityInput = ConstructionEntityInput & {
  attributes?: {
    institutionId?: string;
    institutionName?: string;
    graduationYear?: number;
    program?: string;
    department?: string;
    city?: string;
    email?: string;
  };
};

export type AlumniConstructionEdgeInput = ConstructionEdgeInput & {
  relationKind: "batchmate" | "classmate" | "mentor" | "professional_connection";
};

export type AlumniConstructionSubmission = ConstructionSubmission<AlumniConstructionEntityInput, AlumniConstructionEdgeInput>;
