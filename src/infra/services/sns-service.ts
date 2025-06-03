import { SNS } from "@aws-sdk/client-sns";

import { env } from "@/infra/config/env";

import { FailedToSendEmailError } from "./errors/failed-to-send-email-error";
import { FailedToSubscribeEmailError } from "./errors/failed-to-subscribe-email-error";

export class SNSService {
	private sns: SNS;
	private topicArn: string;

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
		}

		this.sns = new SNS(config);
		this.topicArn = env.AWS_SNS_TOPIC_ARN;
	}

	async sendEmail(
		email: string,
		subject: string,
		message: string,
	): Promise<void> {
		try {
			await this.sns.publish({
				TopicArn: this.topicArn,
				Message: message,
				Subject: subject,
				MessageAttributes: {
					email: {
						DataType: "String",
						StringValue: email,
					},
				},
			});
		} catch (error) {
			console.error("Error sending email via SNS:", error);
			throw new FailedToSendEmailError();
		}
	}

	async subscribeEmail(email: string): Promise<void> {
		try {
			await this.sns.subscribe({
				Protocol: "email",
				TopicArn: this.topicArn,
				Endpoint: email,
			});
		} catch (error) {
			console.error("Error subscribing email to SNS topic:", error);
			throw new FailedToSubscribeEmailError();
		}
	}
}
