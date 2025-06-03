import type { Request, RequestHandler, Response } from "express";

import { OnboardingNotFoundError } from "@/domain/onboarding/errors/onboarding-not-found-error";
import { CategorizeExtractUsecase } from "@/domain/onboarding/usecases/categorize-extract-usecase";

import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import { TransactionRepository } from "@/infra/repositories/transaction-repository";
import { CategorizeExtractRepository } from "@/infra/repositories/categorize-extract-repository";
import { S3Service } from "@/infra/services/s3-service";

const usecase = new CategorizeExtractUsecase(
	new OnboardingRepository(),
	new TransactionRepository(),
	new CategorizeExtractRepository(),
	new S3Service()
);

export const categorizeExtractByOnboardingIdController: RequestHandler = async (
	req: Request,
	res: Response
) => {
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
