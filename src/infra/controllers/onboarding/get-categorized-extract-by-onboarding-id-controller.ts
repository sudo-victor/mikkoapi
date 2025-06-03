import type { Request, RequestHandler, Response } from "express";

import { OnboardingNotFoundError } from "@/domain/onboarding/errors/onboarding-not-found-error";
import { GetCategorizedExtractByOnboardingIdUsecase } from "@/domain/onboarding/usecases/get-categorized-extract-by-onboarding-id-usecase";

import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import { CategorizeExtractRepository } from "@/infra/repositories/categorize-extract-repository";

const usecase = new GetCategorizedExtractByOnboardingIdUsecase(
	new CategorizeExtractRepository(),
	new OnboardingRepository(),
);

export const getCategorizedExtractByOnboardingIdController: RequestHandler =
	async (req: Request, res: Response) => {
		try {
			const { params } = req;
			const result = await usecase.execute({
				onboardingId: params.onboardingId,
			});
			res.status(200).json({ data: result });
			return;
		} catch (error) {
			if (error instanceof OnboardingNotFoundError) {
				res.status(404).json({
					name: error.name,
					message: error.message,
				});
				return;
			}
			res.status(500).json({
				name: error.name,
				message: error.message,
			});
			return;
		}
	};
