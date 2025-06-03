import type { Request, RequestHandler, Response } from "express";
import { z } from "zod";

import { InternalServerError } from "@/core/errors/internal-server-error";

import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import { S3Service } from "@/infra/services/s3-service";
import { CategorizeExtractRepository } from "@/infra/repositories/categorize-extract-repository";
import { SQSService } from "@/infra/services/sqs-service";

import { GenerateSignedUrlToUploadExtractUsecase } from "@/domain/onboarding/usecases/generate-signed-url-to-upload-extract-usecase";

const schema = z.object({
	fileName: z.string().min(1, "filename field is required"),
	fileType: z.string().min(1, "filename field is required"),
});

const usecase = new GenerateSignedUrlToUploadExtractUsecase(
	new OnboardingRepository(),
	new CategorizeExtractRepository(),
	new SQSService(),
	new S3Service(),
);

export const generateSignedUrlToUploadExtractController: RequestHandler =
	async (req: Request, res: Response) => {
		try {
			const { body, params } = req;
			const dataParsed = schema.safeParse(body);
			if (!dataParsed.success) {
				res.status(400).json({
					name: "InvalidBody",
					errors: dataParsed.error.errors.map((error) => ({
						field: error.path[0],
						message: error.message,
					})),
				});
				return;
			}
			const validatedData = dataParsed.data;
			const result = await usecase.execute({
				...validatedData,
				onboardingId: Number(params.onboardingId),
			});
			res.status(200).json({ data: { signedUrl: result } });
			return;
		} catch (error) {
			if (error instanceof InternalServerError) {
				res.status(500).json({
					name: error.name,
					message: error.message,
				});
				return;
			}
		}
	};
