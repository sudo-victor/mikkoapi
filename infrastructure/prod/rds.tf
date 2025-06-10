# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-rds-sg"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "rds" {
  name       = "${local.name_prefix}-rds-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${local.name_prefix}-rds-subnet-group"
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "rds" {
  family = "postgres15"
  name   = "${local.name_prefix}-rds-params"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "none"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }
}

# RDS Instance
resource "aws_db_instance" "postgres" {
  identifier = "${local.name_prefix}-db"

  # Engine
  engine         = "postgres"
  engine_version = "15.12"
  instance_class = "db.t4g.micro"  # ARM instance, cheaper than x86

  # Storage
  allocated_storage     = 20
  storage_type         = "gp2"  # Cheaper than gp3
  storage_encrypted    = true
  max_allocated_storage = 100

  # Credentials
  db_name  = "mikkoprod"
  username = var.db_username
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az              = false  # Single-AZ is cheaper

  # Backup
  backup_retention_period = 7  # Minimum retention
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Performance Insights
  performance_insights_enabled = false  # Disable to save costs

  # Monitoring
  monitoring_interval = 0  # Disable enhanced monitoring to save costs

  # Parameters
  parameter_group_name = aws_db_parameter_group.rds.name

  # Deletion protection
  deletion_protection = true

  # Tags
  tags = {
    Name = "${local.name_prefix}-db"
  }
}

# Output the database endpoint
output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

# Output the database name
output "db_name" {
  value = aws_db_instance.postgres.db_name
}

# Output the complete database URL
output "database_url" {
  value     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
  sensitive = true
} 