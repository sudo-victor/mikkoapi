import { compare, hashSync } from "bcryptjs";

export class SecretService {
	encrypt(value: string) {
		return hashSync(value, 8);
	}

	compare(value: string, hashedValue: string) {
		return compare(value, hashedValue);
	}
}
