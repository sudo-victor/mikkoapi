import express from "express";
import serverless from "serverless-http";

import {
	listTransactionByUserIdController,
	updateManyTransactionsController,
	registerTransactionController
} from "@/infra/controllers/transaction";

const app = express();
app.use(express.json());

app.get("/transactions/by/users/:userId", listTransactionByUserIdController);
app.post("/transaction/of/users/:userId", registerTransactionController);
app.patch("/transactions", updateManyTransactionsController)

export const handler = serverless(app);
