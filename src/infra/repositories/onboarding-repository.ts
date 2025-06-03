import { eq } from "drizzle-orm";
import { db } from "@/infra/config/database";
import { onboardingTable } from "@/infra/db/schema";
import type { Onboarding } from "@/domain/onboarding/types/onboarding";

type CreateOnboarding = Partial<Onboarding> & {
	userId: number
	userEmail: number
	details: string
	goalAmount: string
	months: string
	goalCategory: string
}

export class OnboardingRepository {
	async create(data: CreateOnboarding) {
		const [createdOnboarding] = await db.insert(onboardingTable)
			.values(data)
			.returning();
		return createdOnboarding;
	}

	async findByUserId(userId: number) {
		const onboarding = await db
			.select()
			.from(onboardingTable)
			.where(eq(onboardingTable.userId, userId));

		return onboarding[0] ? onboarding[0] : null;
	}

	async findById(onboardingId: number) {
		const onboarding = await db
			.select()
			.from(onboardingTable)
			.where(eq(onboardingTable.id, onboardingId));

		return onboarding[0] ? onboarding[0] : null;
	}

	async update(onboardingId: number, data: Partial<Onboarding>) {
		const [updatedOnboarding] = await db
			.update(onboardingTable)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(onboardingTable.id, onboardingId))
			.returning();

		return updatedOnboarding;
	}
}
