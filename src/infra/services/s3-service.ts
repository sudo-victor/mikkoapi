import { S3 } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/infra/config/env";

import { FailedToGenerateSignedUrlError } from "./errors/failed-to-generate-signed-url-error";
import { FailedToReadFileFromS3Error } from "./errors/failed-to-read-file-from-s3-error";

export class S3Service {
	private s3: S3;
	private bucket: string;

	constructor() {
		const config = {
			region: env.AWS_REGION,
			credentials: {
				accessKeyId: env.AWS_ACCESS_KEY_ID,
				secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
			},
		};

		if (env.NODE_ENV === "development") {
			config["endpoint"] = env.AWS_ENDPOINT;
			config["forcePathStyle"] = true;
		}

		this.s3 = new S3(config);
		this.bucket = env.AWS_BUCKET_NAME;
	}

	async getFileContent(filename: string): Promise<string> {
		try {
			const response = await this.s3.getObject({
				Bucket: this.bucket,
				Key: filename,
			});

			const streamToString = await response.Body?.transformToString();
			if (!streamToString) {
				throw new Error("Failed to read file content");
			}

			return streamToString;
		} catch (error) {
			console.error("Error reading file from S3:", error);
			throw new FailedToReadFileFromS3Error();
		}
	}

	async generateUploadUrl(
		key: string,
		contentType: string,
		expiresIn = 3600,
	): Promise<string> {
		try {
			const command = new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				ContentType: contentType,
			});
			const signedUrl = await getSignedUrl(this.s3, command, { expiresIn });
			return signedUrl;
		} catch (error) {
			console.error("Error to generate signed url to S3:", error);
			throw new FailedToGenerateSignedUrlError();
		}
	}
}
