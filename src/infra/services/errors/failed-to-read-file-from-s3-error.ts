export class FailedToReadFileFromS3Error extends Error {
	constructor() {
		super("Failed to read file from s3");
	}
}
