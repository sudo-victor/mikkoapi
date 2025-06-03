resource "aws_sns_topic" "notifications" {
  name = "${local.name_prefix}-notifications-topic"
}

output "notifications_topic_arn" {
  value = aws_sns_topic.notifications.arn
} 