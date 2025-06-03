import express from "express";
import serverless from "serverless-http";

import {
	categorizeExtractByOnboardingIdController,
	generateSignedUrlToUploadExtractController,
	getCategorizedExtractByOnboardingIdController,
	getOnboardingController,
	startOnboardingController,
	updateOnboardingController,
	generateFinancialPlanningFromOnboardingController
} from "@/infra/controllers/onboarding";

const app = express();
app.use(express.json());

app.post("/onboarding/start", startOnboardingController);
app.get("/onboarding/details", getOnboardingController);
app.get(
	"/onboarding/:onboardingId/categorize/extract",
	getCategorizedExtractByOnboardingIdController,
);
app.patch(
	"/onboarding/:onboardingId/categorize/extract",
	categorizeExtractByOnboardingIdController,
);
app.patch(
	"/onboarding/:onboardingId/upload/extract",
	generateSignedUrlToUploadExtractController,
);
app.patch("/onboarding/:onboardingId", updateOnboardingController);
app.post("/onboarding/:onboardingId/planning", generateFinancialPlanningFromOnboardingController);

export const handler = serverless(app);
