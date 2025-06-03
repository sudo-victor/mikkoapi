export class FailedToGenerateSignedUrlError extends Error {
	constructor() {
		super("Failed to generate signed url");
	}
}
