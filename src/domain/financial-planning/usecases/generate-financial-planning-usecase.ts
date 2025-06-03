import { OnboardingNotFoundError } from "@/domain/onboarding/errors/onboarding-not-found-error"
import type { FinancialPlanningRepository } from "@/infra/repositories/financial-planning-repository"
import type { OnboardingRepository } from "@/infra/repositories/onboarding-repository"
import type { TransactionRepository } from "@/infra/repositories/transaction-repository"
import { GenerateFinancialPlanningPromptService } from "../services/generate-financial-planning-prompt-service"
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { zodResponseFormat } from "openai/helpers/zod";
import type { GPTService } from "../services/gpt-service";

export class GenerateFinancialPlanningUsecase {
  constructor(
    private financialPlanningRepository: FinancialPlanningRepository,
    private onboardingRepository: OnboardingRepository,
    private transactionRepository: TransactionRepository,
    private gptService: GPTService,
  ) {}

  async execute(input: Input) {
    const { onboardingId } = input
    const onboarding = await this.onboardingRepository.findById(onboardingId)
    if (!onboarding) throw new OnboardingNotFoundError()
    const transactions = await this.transactionRepository.findByUserId(onboarding.userId)
    const prompt = GenerateFinancialPlanningPromptService.make();
    const content = JSON.stringify({
      userProfile: {
        income: onboarding.income,
        savings: onboarding.savings,
        investments: onboarding.investments,
        goalAmount: onboarding.goalAmount,
        goalCategory: onboarding.goalCategory,
        months: onboarding.months,
        effort: onboarding.effort
      },
      transactionHistory: {
        deposits: transactions.filter(t => t.type === 'DEPOSIT').map(t => ({
          value: t.value,
          category: t.category,
          createdAt: t.createdAt
        })),
        withdrawals: transactions.filter(t => t.type === 'WITHDRAW').map(t => ({
          value: t.value,
          category: t.category,
          createdAt: t.createdAt
        }))
      }
    })
    const openaiOptions: ChatCompletionCreateParamsNonStreaming = {
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: content,
        },
      ],
      model: "o4-mini",
      response_format: zodResponseFormat(GenerateFinancialPlanningPromptService.expectedOutput(), "json_object"),
    }
    const result = await this.gptService.parse(openaiOptions)
    return result
  }
}

type Input = {
  onboardingId: number
}