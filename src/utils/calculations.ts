export interface AmortizationRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  months: number
): number => {
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return principal / months;
  }

  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(payment);
};

export const generateAmortizationTable = (
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] => {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
  
  const table: AmortizationRow[] = [];
  let balance = principal;

  for (let period = 1; period <= months; period++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;

    // Ajustar último pago por redondeos
    if (period === months && balance !== 0) {
      balance = 0;
    }

    table.push({
      period,
      payment: monthlyPayment,
      principal: Math.round(principal),
      interest: Math.round(interest),
      balance: Math.round(Math.max(0, balance)),
    });
  }

  return table;
};

export const calculateAccruedInterest = (
  principal: number,
  annualRate: number,
  days: number
): number => {
  const dailyRate = annualRate / 100 / 365;
  return Math.round(principal * dailyRate * days);
};