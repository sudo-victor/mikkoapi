resource "aws_s3_bucket" "mikko" {
  bucket = "${local.name_prefix}-bucket"
}

resource "aws_s3_bucket_cors_configuration" "mikko" {
  bucket = aws_s3_bucket.mikko.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

output "s3_bucket_name" {
  value = aws_s3_bucket.mikko.bucket
} 