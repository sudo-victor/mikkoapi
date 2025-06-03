export type User = {
	name: string;
	email: string;
	phoneNumber?: string;
};

export type UserModel = User & {
	userId: number;
};
