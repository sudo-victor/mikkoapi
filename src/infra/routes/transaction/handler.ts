import express from "express";
import serverless from "serverless-http";
import cors from 'cors';
import compression from 'compression';

import {
	listTransactionByUserIdController,
	updateManyTransactionsController,
	registerTransactionController
} from "@/infra/controllers/transaction";

const app = express();
app.use(express.json());
app.use(cors({
	origin: [
		'http://localhost:3000',
		'https://mikkoapp.com',

	],
	credentials: true,
	methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(compression())

app.get("/transactions/by/users/:userId", listTransactionByUserIdController);
app.post("/transaction/of/users/:userId", registerTransactionController);
app.patch("/transactions", updateManyTransactionsController)

export const handler = serverless(app);
