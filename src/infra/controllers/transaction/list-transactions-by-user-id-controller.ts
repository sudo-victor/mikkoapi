import type { Request, RequestHandler, Response } from "express";

import { InternalServerError } from "@/core/errors/internal-server-error";
import { ListTransactionByUserIdUsecase } from "@/domain/transaction/usecases/list-transactions-by-user-id-usecase";
import { TransactionRepository } from "@/infra/repositories/transaction-repository";

const usecase = new ListTransactionByUserIdUsecase(
	new TransactionRepository(),
);

export const listTransactionByUserIdController: RequestHandler = async (
	req: Request,
	res: Response,
) => {
	try {
		const { params } = req;
		const result = await usecase.execute({
			userId: params.userId,
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
