import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/infra/config/database";
import { usersTable } from "@/infra/db/schema";
import type { User } from "@/domain/user/types/user";

export class UserRepository {
	async create(data: Partial<User> & { email: string }) {
		const [createdUser] = await db.insert(usersTable)
			.values({ ...data })
			.returning();

		return createdUser;
	}

	async findByEmail(email: string) {
		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, email));

		return users[0] ? users[0] : null;
	}

	async findByPhoneNumber(phoneNumber: string) {
		const users = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.phoneNumber, phoneNumber));

		return users[0];
	}
}
