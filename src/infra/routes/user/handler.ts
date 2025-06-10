import express from "express";
import serverless from "serverless-http";
import cors from 'cors'
import compression from 'compression'

import {
	registerUserController,
	resendEmailCodeController,
	signinController,
	validateEmailCodeController,
} from "@/infra/controllers/user";

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

app.post("/users/auth/signup", registerUserController);
app.post("/users/auth/code/resend", resendEmailCodeController);
app.post("/users/auth/code/validate", validateEmailCodeController);
app.post("/users/auth/signin", signinController);

export const handler = serverless(app);
