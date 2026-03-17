terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket         = "dev-afs1-merlynn-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "af-south-1"
    dynamodb_table = "dev-afs1-merlynn-tflock"
    encrypt        = true
  }
}
