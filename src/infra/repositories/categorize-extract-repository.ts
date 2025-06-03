import { eq } from "drizzle-orm";
import { db } from "@/infra/config/database";
import { categorizeExtractTable } from "@/infra/db/schema";
import type { CategorizeExtract } from "@/domain/onboarding/types/categorize-extract";

export class CategorizeExtractRepository {
	async create(onboardingId: number) {
		const [createdCategorizeExtract] = await db.insert(categorizeExtractTable)
			.values({
				onboardingId,
				status: 'PENDING',
				retryCount: 0,
			})
			.returning();
		return createdCategorizeExtract;
	}

	async update(id: number, data: Partial<CategorizeExtract>) {
		const updateData: any = { ...data };
		
		if (data.lastProcessedAt) {
			updateData.lastProcessedAt = new Date(data.lastProcessedAt);
		}
		
		updateData.updatedAt = new Date();

		const [updatedCategorizeExtract] = await db
			.update(categorizeExtractTable)
			.set(updateData)
			.where(eq(categorizeExtractTable.id, id))
			.returning();

		return updatedCategorizeExtract;
	}

	async findById(id: number) {
		const categorizeExtract = await db
			.select()
			.from(categorizeExtractTable)
			.where(eq(categorizeExtractTable.id, id));

		return categorizeExtract[0] || null;
	}

	async findByOnboardingId(onboardingId: number) {
		const categorizeExtract = await db
			.select()
			.from(categorizeExtractTable)
			.where(eq(categorizeExtractTable.onboardingId, onboardingId));

		return categorizeExtract[0] || null;
	}
} 