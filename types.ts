
export interface Earnings {
  basicPay: number;
  overtime: number;
  houseAllowance: number;
  travelAllowance: number;
  bonus: number;
}

export interface Deductions {
  paye: number;
  nssf: number;
  sha: number;
  housingLevy: number;
  advances: number;
  loanRepayments: number;
  saccos: number;
}

export interface Payroll {
  id: string;
  firstName: string;
  lastName: string;
  date: string;
  payrollNumber: string;
  month: string;
  pinNo: string;
  nssfNo: string;
  shaNo: string;
  earnings: Earnings;
  deductions: Deductions;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  signature: string; // base64 string
  initials: string;
}
