export interface AmputeeDetails {
  // Nested object including arrays like children
  [key: string]: any;
}

export interface FamilyMemberDetails {
  // Nested object
  [key: string]: any;
}

export interface AmputationDescription {
  // Nested object with arrays
  [key: string]: any;
}

export interface ProsthesisUsage {
  // Nested object with arrays
  [key: string]: any;
}

export interface GeneralQuestions {
  // Nested object with arrays
  [key: string]: any;
}

export interface Metadata {
  submittedAt: Date | string;
  formId: string;
}

export interface RegistrantPayload {
  userType: string;
  email: string;
  amputeeDetails?: AmputeeDetails;
  familyMemberDetails?: FamilyMemberDetails;
  amputationDescription?: AmputationDescription;
  prosthesisUsage?: ProsthesisUsage;
  generalQuestions?: GeneralQuestions;
  metadata?: Metadata;
}
