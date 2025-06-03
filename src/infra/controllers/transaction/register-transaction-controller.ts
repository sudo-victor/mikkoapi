import { z } from "zod";
import type { Request, RequestHandler, Response } from "express";

import { InternalServerError } from "@/core/errors/internal-server-error";
import { TransactionType } from "@/domain/transaction/types/transaction";
import { RegisterTransactionUsecase } from "@/domain/transaction/usecases/register-transaction-usecase";
import { TransactionRepository } from "@/infra/repositories/transaction-repository";
import { WalletRepository } from "@/infra/repositories/wallet-repository";

const schema = z.object({
	category: z.string().min(1, "category field is required"),
	type: z.enum([TransactionType.WITHDRAW, TransactionType.DEPOSIT]),
	value: z.number(),
	userId: z.number(),
	title: z.string().optional(),
});

const usecase = new RegisterTransactionUsecase(
	new TransactionRepository(),
	new WalletRepository()
);

export const registerTransactionController: RequestHandler = async (
	req: Request,
	res: Response,
) => {
	try {
		const { body, params } = req;

		const bodyParsed = schema.safeParse({...body,...params});

		if (!bodyParsed.success) {
			res.status(400).json({
				errors: bodyParsed.error.errors.map((error) => ({
					field: error.path[0],
					message: error.message,
				})),
			});
			return;
		}

		const result = await usecase.execute({
			category: bodyParsed.data.category,
			type: bodyParsed.data.type,
			value: bodyParsed.data.value,
			userId: bodyParsed.data.userId,
		});

		res.status(200).json({ data: result });
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
