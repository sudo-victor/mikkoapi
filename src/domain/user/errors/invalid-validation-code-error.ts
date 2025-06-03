export class InvalidValidationCodeError extends Error {
	constructor() {
		super("Invalid validation code");
	}
}
