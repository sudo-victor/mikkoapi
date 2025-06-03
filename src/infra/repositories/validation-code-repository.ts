import { eq, desc, and } from "drizzle-orm";
import { db } from "@/infra/config/database";
import { validationCodeTable } from "@/infra/db/schema";
import type { ValidationCode } from "@/domain/user/types/validation-code";

export class ValidationCodeRepository {
	async create(data: Omit<ValidationCode, "createdAt">) {
		const validationCodeData = {
			userId: data.userId,
			hashedCode: data.hashedCode,
			status: data.status,
			expiredAt: new Date(data.expiredAt),
			createdAt: new Date(),
		};

		const [createdCode] = await db.insert(validationCodeTable)
			.values(validationCodeData)
			.returning();
			
		return createdCode;
	}

	async findLastCodeByUserId(userId: number) {
		const codes = await db
			.select()
			.from(validationCodeTable)
			.where(and(
				eq(validationCodeTable.userId, userId),
				eq(validationCodeTable.status, 'PENDING')
			))
			.orderBy(desc(validationCodeTable.createdAt))
			.limit(1);
		
		return codes[0];
	}

	async updateStatus(id: number, status: string) {
		const [updatedCode] = await db
			.update(validationCodeTable)
			.set({ status })
			.where(eq(validationCodeTable.id, id))
			.returning();
			
		return updatedCode;
	}
}
