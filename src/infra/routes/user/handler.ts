import express from "express";
import serverless from "serverless-http";

import {
	registerUserController,
	resendEmailCodeController,
	signinController,
	validateEmailCodeController,
} from "@/infra/controllers/user";

const app = express();
app.use(express.json());

app.post("/users/auth/signup", registerUserController);
app.post("/users/auth/code/resend", resendEmailCodeController);
app.post("/users/auth/code/validate", validateEmailCodeController);
app.post("/users/auth/signin", signinController);

export const handler = serverless(app);
