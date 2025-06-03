import { db } from "@/infra/config/database";
import { walletTable } from "@/infra/db/schema";
import { Wallet } from "@/domain/user/types/wallet";
import { eq } from "drizzle-orm";

export class WalletRepository {
	async create(data: Wallet) {
		const walletData = {			
			balance: data.balance,
			userId: data.userId,
		};
		
		const [createdWallet] = await db.insert(walletTable)
			.values(walletData)
			.returning();
			
		return createdWallet;
	}

	async updateBalance(userId: number, balance: number) {
		const [updatedWallet] = await db.update(walletTable)
			.set({ 
				balance,
				updatedAt: new Date()
			})
			.where(eq(walletTable.userId, userId))
			.returning();
			
		return updatedWallet;
	}

	async findByUserId(userId: number) {
		const [wallet] = await db
			.select()
			.from(walletTable)
			.where(eq(walletTable.userId, userId));
			
		return wallet;
	}
}
