resource "aws_sqs_queue" "categorize_extract" {
  name                       = "${local.name_prefix}-categorize-extract"
  visibility_timeout_seconds = 900
  message_retention_seconds  = 345600
}

# Output the queue URL and ARN
output "categorize_extract_queue_url" {
  value = aws_sqs_queue.categorize_extract.url
}

output "categorize_extract_queue_arn" {
  value = aws_sqs_queue.categorize_extract.arn
} 