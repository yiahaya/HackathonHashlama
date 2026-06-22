export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface Child {
  childName: string;
  childBirthDate: Date | string;
}

export interface AmputeeDetails {
  firstName: string;
  lastName: string;
  birthDate: Date | string;
  gender: string;
  mobileNumber: string;
  address: Address;
  maritalStatus: string;
  religiousAffiliation: string;
  hasChildren: boolean;
  numberOfChildren: number;
  children: Child[];
}

export interface FamilyMemberDetails {
  firstName: string;
  lastName: string;
  relationToAmputee: string;
  interestedInPartnerSupportGroup: boolean;
  interestedInParentSupportGroup: boolean;
  preferredNumberForUpdates: string;
  mobileNumber: string;
  additionalContactMobile: string;
  additionalContactEmail: string;
  additionalContactFullName: string;
  additionalContactRelation: string;
}

export interface AmputationDescription {
  amputationDate: Date | string;
  amputationReason: string;
  circumstancesDescription: string;
  insuringBody: string;
  amputationTypes: string[];
  amputatedArms: string[];
  amputatedLegs: string[];
  rightArmAmputationLevel: string;
  leftArmAmputationLevel: string;
  rightLegAmputationLevel: string;
  leftLegAmputationLevel: string;
  dailyActivityLevel: string;
  dailyActivityDescription: string;
  inactivityReason: string;
  usesProsthesis: string;
  reasonNotFittedYet: string;
  reasonNotUsingProsthesis: string;
  otherAssistiveDevices: string;
  wantsToMentorNewAmputees: boolean;
  wantsVeteranMentor: boolean;
}

export interface ProsthesisUsage {
  prostheticsInstituteName: string;
  armProsthesisType: string;
  legProsthesisType: string;
  prosthesisUsageFrequency: string;
  hasSportsProsthesis: boolean;
  sportsProsthesisTypes: string[];
  latestAMPTestResult: string;
}

export interface GeneralQuestions {
  familiarWithRights: string;
  receivingDisabilityAllowance: string;
  educationLevel: string;
  degreeField: string;
  professionalCourseField: string;
  professionalExperienceFields: string[];
  professionalExperienceDetails: string;
  currentlyWorkingFullTime: string;
  engagesInSportsOrExtremeHobbies: string;
  interestedAssociationActivities: string[];
  interestedSportsActivities: string[];
  aboutYourself: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  agreesToUpdates: boolean;
  agreesToPhysicalMail: boolean;
  mailingAddress: Address & { zipCode?: string };
}

export interface Metadata {
  submittedAt: Date | string;
  formId: string;
}

export interface RegistrationPayload {
  userType: string;
  email: string;
  amputeeDetails?: AmputeeDetails;
  familyMemberDetails?: FamilyMemberDetails;
  amputationDescription?: AmputationDescription;
  prosthesisUsage?: ProsthesisUsage;
  generalQuestions?: GeneralQuestions;
  metadata?: Metadata;
}
