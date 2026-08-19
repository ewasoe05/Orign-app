export type DebtAccountOrderFields = {
  id: string;
  priority: number;
  current_balance: number;
  is_paid_off?: boolean;
};

/** Avalanche order: priority, then smallest balance, then stable id. */
export function comparePayoffOrder(
  a: DebtAccountOrderFields,
  b: DebtAccountOrderFields,
): number {
  if (Boolean(a.is_paid_off) !== Boolean(b.is_paid_off)) {
    return a.is_paid_off ? 1 : -1;
  }

  return (
    a.priority - b.priority ||
    Number(a.current_balance) - Number(b.current_balance) ||
    a.id.localeCompare(b.id)
  );
}

export function sortAccountsByPayoffOrder<T extends DebtAccountOrderFields>(
  accounts: T[],
): T[] {
  return [...accounts].sort(comparePayoffOrder);
}

export function contiguousPriorities(accountIds: string[]): { id: string; priority: number }[] {
  return accountIds.map((id, index) => ({ id, priority: index + 1 }));
}

export function normalizeSeedPriorities(
  accounts: readonly { name: string; priority: number }[],
): { name: string; priority: number }[] {
  const savor = accounts.find((account) => account.name.includes("Savor"));
  const citizens = accounts.find((account) => account.name.includes("Citizens"));
  const amazon = accounts.find((account) => account.name.includes("Amazon"));
  const quicksilver = accounts.find((account) => account.name.includes("Quicksilver"));
  const ford = accounts.find((account) => account.name.includes("Ford"));

  const ordered = [savor, citizens, amazon, quicksilver, ford].filter(Boolean) as {
    name: string;
    priority: number;
  }[];

  return ordered.map((account, index) => ({ ...account, priority: index + 1 }));
}
