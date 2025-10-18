export enum LoanStatus {
  PENDING_STAFF_APPROVAL = 'PENDING_STAFF_APPROVAL',
  PENDING_MANAGER_APPROVAL = 'PENDING_MANAGER_APPROVAL',
  PENDING_BENDAHARA_APPROVAL = 'PENDING_BENDAHARA_APPROVAL',
  PENDING_KETUA_APPROVAL = 'PENDING_KETUA_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Loan {
  id: number;
  employeeId: number;
  memberName: string;
  amount: number;
  tenure: number; // in months
  status: LoanStatus;
  createdAt: Date;
  updatedAt: Date;
  approver_level_1_id?: number;
  approver_level_2_id?: number;
  approver_level_3_id?: number;
  approver_level_4_id?: number;
  rejectionReason?: string;
}