import { randomUUID } from "node:crypto";
import {
	GetCommand,
	PutCommand
} from "@aws-sdk/lib-dynamodb";

import { docClient } from "@/infra/libs/dynamodb";

import type { FinancialPlanning } from "@/domain/financial-planning/types/financial-planning";

export class FinancialPlanningRepository {
	private name = "FinancialPlanning";

	async create(data: FinancialPlanning) {
		const financialPlanningData = {
			financialPlanningId: randomUUID(),
			...data,
			createdAt: new Date().toISOString(),
		};
		const params = {
			TableName: this.name,
			Item: financialPlanningData,
		};
		const command = new PutCommand(params);
		await docClient.send(command);
		return financialPlanningData;
	}

	async findById(financialPlanningId: string) {
		const params = {
			TableName: this.name,
			Key: {
				financialPlanningId: financialPlanningId,
			},
		};

		const command = new GetCommand(params);
		const response = await docClient.send(command);
		return response.Item;
	}
}
