import { randomUUID } from "node:crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "@/infra/config/database";
import { transactionTable } from "@/infra/db/schema";
import type { Transaction } from "@/domain/transaction/types/transaction";

export class TransactionRepository {
	async create(data: Omit<Transaction, 'createdAt' | 'title'>) {
		const transactionData = {
			userId: data.userId,
			value: data.value,
			category: data.category,
			type: data.type,
		};

		const [createdTransaction] = await db.insert(transactionTable)
			.values(transactionData)
			.returning();
			
		return createdTransaction;
	}

	async findByUserId(userId: number) {
		const transactions = await db
			.select()
			.from(transactionTable)
			.where(eq(transactionTable.userId, userId));
			
		return transactions;
	}

	async findById(transactionId: number) {
		const [transaction] = await db
			.select()
			.from(transactionTable)
			.where(eq(transactionTable.id, transactionId));
			
		return transaction;
	}

	async findLastTransaction(userId: number) {
		const [lastTransaction] = await db
			.select()
			.from(transactionTable)
			.where(eq(transactionTable.userId, userId))
			.orderBy(desc(transactionTable.createdAt))
			.limit(1);

		return lastTransaction;
	}

	async createBatch(transactions: Transaction[]) {
		if (transactions.length === 0) {
			return [];
		}
		
		const transactionsData = transactions.map(transaction => ({
			transactionId: randomUUID(),
			userId: transaction.userId,
			value: transaction.value,
			title: transaction.title,
			category: transaction.category,
			type: transaction.type,
		}));
		
		const createdTransactions = await db.insert(transactionTable)
			.values(transactionsData)
			.returning();
			
		return createdTransactions;
	}

	async updateBatch(transactions: any[]) {
		if (transactions.length === 0) {
			return [];
		}
		
		const updatedTransactions = await db.transaction(async (tx) => {
			const results: typeof transactionTable.$inferSelect[] = [];
			
			for (const transaction of transactions) {
				if (!transaction.transactionId) {
					throw new Error("Transaction ID is required for update");
				}
				
				const [updated] = await tx
					.update(transactionTable)
					.set({
						value: transaction.value,
						title: transaction.title,
						category: transaction.category,
						type: transaction.type,
						updatedAt: new Date()
					})
					.where(eq(transactionTable.id, transaction.transactionId))
					.returning();
					
				results.push(updated);
			}
			
			return results;
		});
		
		return updatedTransactions;
	}
}
