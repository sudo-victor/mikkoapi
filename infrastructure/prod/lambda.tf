# Security Group for Lambda
resource "aws_security_group" "lambda" {
  name        = "${local.name_prefix}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-lambda-sg"
  }
}

# Lambda Functions
resource "aws_lambda_function" "categorize_extract" {
  filename         = "../../.serverless/build/mikkoapi-categorize-extract.zip"
  function_name    = "${local.name_prefix}-categorize-extract"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/infra/queues/categorize-extract/handler.handler"
  runtime         = "nodejs20.x"
  timeout         = 900

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      CATEGORIZE_EXTRACT_QUEUE_URL = aws_sqs_queue.categorize_extract.url
      SNS_TOPIC_ARN               = aws_sns_topic.notifications.arn
      S3_BUCKET_NAME              = aws_s3_bucket.mikko.bucket
      DATABASE_URL                = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
    }
  }
}

resource "aws_lambda_function" "onboarding" {
  filename         = "../../.serverless/build/mikkoapi-onboarding.zip"
  function_name    = "${local.name_prefix}-onboarding"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/infra/routes/onboarding/handler.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
}

resource "aws_lambda_function" "user" {
  filename         = "../../.serverless/build/mikkoapi-user.zip"
  function_name    = "${local.name_prefix}-user"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/infra/routes/user/handler.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
}

resource "aws_lambda_function" "transaction" {
  filename         = "../../.serverless/build/mikkoapi-transaction.zip"
  function_name    = "${local.name_prefix}-transaction"
  role            = aws_iam_role.lambda_role.arn
  handler         = "src/infra/routes/transaction/handler.handler"
  runtime         = "nodejs20.x"
  timeout         = 30

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# API Gateway
resource "aws_apigatewayv2_api" "api" {
  name          = "${local.name_prefix}-api"
  protocol_type = "HTTP"
}

# API Gateway Integrations
resource "aws_apigatewayv2_integration" "onboarding" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.onboarding.invoke_arn
}

resource "aws_apigatewayv2_integration" "user" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.user.invoke_arn
}

resource "aws_apigatewayv2_integration" "transaction" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.transaction.invoke_arn
}

# API Gateway Routes
resource "aws_apigatewayv2_route" "onboarding" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /onboarding/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.onboarding.id}"
}

resource "aws_apigatewayv2_route" "user" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /users/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.user.id}"
}

resource "aws_apigatewayv2_route" "transaction" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /transactions/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.transaction.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.api.id
  name   = "$default"
  auto_deploy = true
}

# Lambda Permissions
resource "aws_lambda_permission" "onboarding" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.onboarding.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "user" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "transaction" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transaction.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# SQS Trigger for Categorize Extract Lambda
resource "aws_lambda_event_source_mapping" "categorize_extract" {
  event_source_arn = aws_sqs_queue.categorize_extract.arn
  function_name    = aws_lambda_function.categorize_extract.function_name
  batch_size       = 3
}

# Outputs
output "api_endpoint" {
  value = aws_apigatewayv2_api.api.api_endpoint
} 