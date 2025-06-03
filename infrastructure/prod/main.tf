terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-2"
}

# Variables
variable "environment" {
  description = "Environment name (e.g., prod, dev)"
  type        = string
  default     = "prod"
}

# Local variables
locals {
  name_prefix = "${var.environment}-mikko"
}
