export type ValidationCodeStatus = "PENDING" | "VERIFIED" | "EXPIRED";

export type ValidationCode = {
	status: ValidationCodeStatus;
	userId: number;
	hashedCode: string;
	expiredAt: Date | string;
	createdAt: Date | string;
};
