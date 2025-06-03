variable "db_username" {
  description = "Username for the RDS instance"
  type        = string
  sensitive   = true
  default     = "mikkouser"

  validation {
    condition = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_username)) && length(var.db_username) <= 63
    error_message = "Database username must start with a letter, contain only letters, numbers, and underscores, and be max 63 characters."
  }
}

variable "db_password" {
  description = "Password for the RDS instance"
  type        = string
  sensitive   = true
  default     = "MikkoPassword123!"

  validation {
    condition = length(var.db_password) >= 8 && length(var.db_password) <= 128
    error_message = "Database password must be between 8 and 128 characters."
  }
} 