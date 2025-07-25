export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'VENDOR' | 'ADMIN';
  companyName?: string;
  ueiNumber?: string;
  socioEconomicStatus: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Solicitation {
  id: string;
  number: string;
  title: string;
  agency: string;
  description: string;
  dueDate: Date;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  clins: Clin[];
  attachments?: Attachment[];
}

export interface Clin {
  id: string;
  name: string;
  description: string;
  pricingModel: 'FFP' | 'TM' | 'CR';
  solicitationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'AWARDED' | 'REJECTED';
  submissionDate: Date;
  notes?: string;
  vendorId: string;
  solicitationId: string;
  technicalFiles?: FileAttachment[];
  pastPerformanceFiles?: FileAttachment[];
  pricingData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  question: string;
  answer?: string;
  status: 'PENDING' | 'ANSWERED';
  dateAsked: Date;
  dateAnswered?: Date;
  vendorId: string;
  solicitationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  name: string;
  size: string;
  type?: string;
}

export interface FileAttachment {
  name: string;
  size: string;
  type: string;
}

// Frontend-only types for the prototype
export interface SampleSolicitation {
  id: string;
  number: string;
  title: string;
  agency: string;
  dueDate: string;
  questionCutoffDate?: string;
  proposalCutoffDate?: string;
  description: string;
  status: string;
  attachments: Attachment[];
  clins: SampleClin[];
  evaluationPeriods?: EvaluationPeriod[];
}

export interface EvaluationPeriod {
  id: string;
  name: string;
  type: 'base' | 'option';
}

export interface SampleClin {
  id: string;
  name: string;
  description: string;
  pricingModel: string;
  periodId: string;
}

export interface SampleQuestion {
  id: string;
  solicitationId: string;
  vendorId: string;
  question: string;
  answer: string;
  status: 'DRAFT' | 'SUBMITTED' | 'ANSWERED' | 'POSTED';
  dateAsked: string;
  dateAnswered: string;
  dateSubmitted?: string;
  datePosted?: string;
  isQuestionDraft: boolean;
  isAnswerDraft: boolean;
}

export interface SampleProposal {
  id: string;
  solicitationId: string;
  vendorId: string;
  status: string;
  submissionDate: string;
  notes?: string;
  technicalFiles?: FileAttachment[];
  pastPerformanceFiles?: FileAttachment[];
  pricingData?: any;
}

export interface SampleUser {
  id: string;
  name?: string;
  email: string;
  companyName?: string;
  ueiNumber?: string;
  socioEconomicStatus: string[];
  registrationDate?: string;
}