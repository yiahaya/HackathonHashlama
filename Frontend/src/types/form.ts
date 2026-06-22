export interface ChildDetails {
  name: string;
  birthDate: string;
}

export interface FormData {
  userType: 'Amputee' | 'Parent/Family Member' | '';
  
  amputeeDetails: {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    mobileNumber: string;
    address: string;
    maritalStatus: string;
    selfDefinition: string;
    hasChildren: boolean;
    children: ChildDetails[];
  };

  parentDetails: {
    firstName: string;
    lastName: string;
    relationToAmputee: string;
    supportGroupPartners: string;
    supportGroupParents: string;
    updatePhoneType: string;
    mobileNumber: string;
    additionalContactNumber: string;
    updateEmail: string;
  };

  amputationDescription: {
    amputationDate: string;
    reason: string;
    circumstances: string;
    insuringBody: string;
    amputationType: string[]; // Hand, Leg, etc.
    whichLimb: string[]; // Left, Right
    amputationLevel: string[];
    dailyActivityLevel: string;
    dailyActivityDescription: string;
    usesProsthesis: string;
    reasonNoProsthesis: string;
    usesAssistiveDevice: string;
    mentorNewAmputees: string;
    wantVeteranMentor: string;
  };

  prosthesisUsage: {
    instituteName: string;
    prosthesisType: string;
    usageFrequency: string;
    hasSportsProsthesis: string;
    sportsProsthesisType: string[];
    ampTestResult: string;
  };

  generalQuestions: {
    familiarWithRights: string;
    receivingDisability: string;
    educationLevel: string;
    studyField: string;
    experienceField: string[];
    experienceDetails: string;
    workingFullTime: string;
    engageInSports: string;
    interestedActivities: string[];
    interestedSports: string[];
    aboutYourself: string;
    emergencyContactPhone: string;
    emergencyContactName: string;
    consentUpdates: boolean;
    consentMail: boolean;
    fullAddress: string;
  };
}

export const initialFormData: FormData = {
  userType: '',
  amputeeDetails: {
    firstName: '', lastName: '', birthDate: '', gender: '', mobileNumber: '',
    address: '', maritalStatus: '', selfDefinition: '', hasChildren: false, children: []
  },
  parentDetails: {
    firstName: '', lastName: '', relationToAmputee: '', supportGroupPartners: '',
    supportGroupParents: '', updatePhoneType: '', mobileNumber: '', additionalContactNumber: '', updateEmail: ''
  },
  amputationDescription: {
    amputationDate: '', reason: '', circumstances: '', insuringBody: '',
    amputationType: [], whichLimb: [], amputationLevel: [], dailyActivityLevel: '',
    dailyActivityDescription: '', usesProsthesis: '', reasonNoProsthesis: '',
    usesAssistiveDevice: '', mentorNewAmputees: '', wantVeteranMentor: ''
  },
  prosthesisUsage: {
    instituteName: '', prosthesisType: '', usageFrequency: '', hasSportsProsthesis: '',
    sportsProsthesisType: [], ampTestResult: ''
  },
  generalQuestions: {
    familiarWithRights: '', receivingDisability: '', educationLevel: '', studyField: '',
    experienceField: [], experienceDetails: '', workingFullTime: '', engageInSports: '',
    interestedActivities: [], interestedSports: [], aboutYourself: '', emergencyContactPhone: '',
    emergencyContactName: '', consentUpdates: false, consentMail: false, fullAddress: ''
  }
};
