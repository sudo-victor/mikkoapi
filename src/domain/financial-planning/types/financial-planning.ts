type PriorityLevel = 'low' | 'medium' | 'high';

type BudgetCategory = {
	name: string;
	amount: number;
}

type FinancialGoal = {
	description: string;
	targetAmount: number;
}

type MonthlyProjection = {
	month: string;
	expectedBalance: number;
}

export type FinancialPlanning = {
	title: string;
	description: string;
	priority: PriorityLevel;
	startDate: string;
	endDate: string;
	monthlyBudget: number;
	budgetCategories: BudgetCategory[];
	financialGoals: FinancialGoal[];
	monthlyProjections: MonthlyProjection[];
	spendSugestionPerMonth: number;
	spendSugestionCategory: { category: string, value: number }[]
};
