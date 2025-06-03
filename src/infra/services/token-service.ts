import { type Secret, type SignOptions, sign, verify } from "jsonwebtoken";

import { env } from "../config/env";

type TokenPayload = {
	sub: string;
	email: string;
	name: string;
};

export class TokenService {
	generate(payload: TokenPayload): string {
		const token = sign(
			payload,
			env.JWT_SECRET as Secret,
			{
				expiresIn: env.JWT_EXPIRES_IN,
			} as SignOptions,
		);
		return token;
	}

	verify(token: string): TokenPayload {
		const decoded = verify(token, env.JWT_SECRET as Secret) as TokenPayload;
		return decoded;
	}
}
