provider "aws" {
  region = local.aws_region
  default_tags {
    tags = {
      Owner       = "merlynn"
      Environment = local.env
      ManagedBy   = "Terraform"
      Project     = "merlynn-demo"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = {
      Owner       = "merlynn"
      Environment = local.env
      ManagedBy   = "Terraform"
      Project     = "merlynn-demo"
    }
  }
}
