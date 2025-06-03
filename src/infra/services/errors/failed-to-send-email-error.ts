export class FailedToSendEmailError extends Error {
	constructor() {
		super("Failed to send email");
	}
}
