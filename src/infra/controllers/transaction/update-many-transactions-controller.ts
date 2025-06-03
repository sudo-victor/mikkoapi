import { z } from "zod";
import type { Request, RequestHandler, Response } from "express";

import { InternalServerError } from "@/core/errors/internal-server-error";

import type { Transaction } from "@/domain/transaction/types/transaction";
import { UpdateManyTransactionsUsecase } from "@/domain/transaction/usecases/update-many-transactions-usecase";

import { TransactionRepository } from "@/infra/repositories/transaction-repository";

const schema = z.object({
	transactions: z.array(z.object({
		title: z.string().min(1, "title field is required"),
		category: z.string().min(1, "category field is required"),
		type: z.string().min(1, "type field is required"),
		value: z.number(),
		userId: z.string(),
		transactionId: z.string(),
		createdAt: z.string(),
	}))
});

const usecase = new UpdateManyTransactionsUsecase(
	new TransactionRepository(),
);

export const updateManyTransactionsController: RequestHandler = async (
	req: Request,
	res: Response,
) => {
	try {
		const { body } = req;

		const bodyParsed = schema.safeParse(body);

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
			transactions: bodyParsed.data.transactions as unknown as Transaction[],
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
