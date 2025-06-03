import { z } from "zod";

export class GenerateFinancialPlanningPromptService {
  static make() {
    return [
      'Você é um assistente especializado em planejamento financeiro pessoal, focado em planos realistas e personalizados.',
      'Tarefa: Elaborar um planejamento financeiro baseado em:',
      '- Objetivos financeiros do usuário',
      '- Perfil e histórico de transações',
      '- Transações classificadas por tipo (WITHDRAW, DEPOSIT) e categoria',
      'Categorias válidas:',
      'Dívidas, Cartão de Crédito, Empréstimos, Financiamentos, Investimentos, Poupança, Renda Fixa,',
      'Restaurantes, Mercado, Saúde, Educação, Serviços, Moradia, Vestuário, Assinaturas,',
      'Utilidades, Presentes, Lazer, Transporte, Outros',
      'Objetivos:',
      '- Criar plano alinhado aos hábitos e metas do usuário',
      '- Estabelecer orçamento mensal realista',
      '- Definir metas financeiras claras e alcançáveis',
      '- Propor projeções de saldo mensal',
      '- Identificar oportunidades de economia',
      '- Sugerir alocação de gastos por categoria',
      'Formato de saída:',
      '{',
      'financialHealth: { status: "excellent" | "good" | "regular" | "bad" | "critical", description: string, recommendation: string },',
      'financialGoal: { description: string; targetAmount: number },',
      'financialPlanning: {',
      '  title: string;',
      '  description: string;',
      '  priority: \'low\' | \'medium\' | \'high\';',
      '  startDate: string;',
      '  endDate: string;',
      '  monthlyBudget: number;',
      '  budgetCategories: BudgetCategory[];',
      '  spendSugestionPerMonth: number;',
      '  spendSugestionCategory: { category: string; value: number, description: string }[];',
      '}',
      '}',
      'Exemplo de resposta:',
      '{',
      'financialHealth: {',
      '  status: "good",',
      '  description: "Boa gestão financeira com reserva de emergência e baixo endividamento",',
      '  recommendation: "Manter a poupança, reduzir gastos supérfluos e evitar novas dívidas"',
      '},',
      'financialGoal: { description: "Reserva de emergência", targetAmount: 10000 },',
      'financialPlanning: {',
      '  title: "Plano de estabilidade financeira",',
      '  description: "Foco em criar reserva e reduzir dívidas",',
      '  priority: "high",',
      '  startDate: "2024-03-01",',
      '  endDate: "2024-12-31",',
      '  monthlyBudget: 5000,',
      '  budgetCategories: [{ name: "Mercado", amount: 1500 }],',
      '  spendSugestionPerMonth: 4000,',
      '  spendSugestionCategory: [{ category: "Mercado", value: 1500, description: "Reduza o mercado em tanto utilizando promoçoes" }],',
      '}',
      '}',
      'Instruções:',
      '- Use apenas dados de transações classificadas',
      '- Considere hábitos financeiros (frequência, valores, sazonalidade)',
      '- Mantenha metas realistas e alcançáveis',
      '- Equilibre despesas e receitas',
      '- Retorne resposta no formato FinancialPlanning especificado',
      '- Todos os valores enviados e gerados devem ser em centavos',
      '- Avalie a saúde financeira seguindo os critérios:',
      'Excelente:',
      '- Gasta menos de 60% da renda mensal',
      '- Poupa pelo menos 20% da renda mensal',
      '- Reserva de emergência cobre mais de 6 meses de despesas',
      '- Sem dívidas ou com dívidas bem administradas (parcelas abaixo de 20% da renda)',
      '- Recomendação: Manter hábitos financeiros saudáveis e investir para crescimento patrimonial',
      'Boa:',
      '- Gasta entre 60% e 75% da renda mensal',
      '- Poupa entre 10% e 20% da renda mensal',
      '- Reserva de emergência cobre entre 3 e 6 meses de despesas',
      '- Dívidas controladas (parcelas abaixo de 30% da renda)',
      '- Recomendação: Manter a poupança, reduzir gastos supérfluos e evitar novas dívidas',
      'Regular:',
      '- Gasta entre 75% e 90% da renda mensal',
      '- Poupa menos de 10% da renda mensal',
      '- Reserva de emergência cobre menos de 3 meses de despesas',
      '- Dívidas elevadas (parcelas entre 30% e 50% da renda)',
      '- Recomendação: Priorizar a criação de reserva de emergência, cortar gastos e negociar dívidas',
      'Ruim:',
      '- Gasta mais de 90% da renda mensal',
      '- Não consegue poupar',
      '- Sem reserva de emergência',
      '- Endividamento alto (parcelas acima de 50% da renda)',
      '- Recomendação: Criar um plano de reestruturação financeira urgente, renegociar dívidas e buscar renda extra',
      'Crítica:',
      '- Gasta mais do que ganha (saldo mensal negativo)',
      '- Está em situação de inadimplência ou com risco alto de endividamento',
      '- Sem reserva de emergência e dificuldades em cobrir despesas básicas',
      '- Recomendação: Foco total em reduzir gastos essenciais, buscar auxílio financeiro e reorganizar as finanças para evitar colapso'
    ].join('\n');
  }

  static expectedOutput() {
    const budgetCategorySchema = z.object({
      name: z.string(),
      amount: z.number(),
    });

    const spendSuggestionCategorySchema = z.object({
      category: z.string(),
      value: z.number(),
      description: z.string(),
    });

    const goalSchema = z.object({
      description: z.string(),
      value: z.number(),
    });

    const financialHealthSchema = z.object({
      status: z.enum(["excellent", "good", "regular", "bad", "critical"]),
      description: z.string(),
      recommendation: z.string(),
    });

    const financialPlanningSchema = z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      startDate: z.string(),
      endDate: z.string(),
      monthlyBudget: z.number(),
      budgetCategories: z.array(budgetCategorySchema),
      spendSugestionPerMonth: z.number(),
      spendSugestionCategory: z.array(spendSuggestionCategorySchema),
    });

    const fullSchema = z.object({
      financialHealth: financialHealthSchema,
      budgetCategory: z.array(budgetCategorySchema),
      financialGoal: goalSchema,
      financialPlanning: financialPlanningSchema,
    });

    return fullSchema
  }
}
