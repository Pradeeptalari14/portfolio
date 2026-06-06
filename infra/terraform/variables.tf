variable "aws_region" {
  type        = string
  description = "The AWS region to deploy resources."
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "The deployment environment (e.g. dev, staging, prod)."
  default     = "production"
}

variable "project_name" {
  type        = string
  description = "The project name prefix."
  default     = "pradeep-portfolio"
}

variable "domain_name" {
  type        = string
  description = "The primary custom domain name for the portfolio."
  default     = "talaripradeep.info"
}

variable "additional_tags" {
  type        = map(string)
  description = "A mapping of tags to assign to the resources."
  default = {
    Owner       = "Talari Pradeep"
    ManagedBy   = "Terraform"
    Repository  = "portfolio"
  }
}
