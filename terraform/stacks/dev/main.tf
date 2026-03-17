# ═══════════════════════════════════════════════════════════════
# Merlynn Risk Monitor — Dev Stack
# ═══════════════════════════════════════════════════════════════

# ─── DNS: Hosted Zone ───────────────────────────────────────
data "aws_route53_zone" "root" {
  name         = local.root_domain
  private_zone = false
}

# ─── ACM Certificate (us-east-1, for future CloudFront use) ──
module "acm_certs" {
  source = "../../modules/acm_certs"
  providers = {
    aws = aws.us_east_1
  }

  root_domain = local.root_domain
  san_names   = ["*.${local.root_domain}"]
}

# ─── ACM Certificate (af-south-1, required for ALB) ─────────
resource "aws_acm_certificate" "regional" {
  domain_name               = "*.${local.root_domain}"
  subject_alternative_names = [local.root_domain]
  validation_method         = "DNS"
}

resource "aws_route53_record" "regional_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.regional.domain_validation_options :
    dvo.domain_name => dvo
  }
  zone_id         = data.aws_route53_zone.root.zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  ttl             = 300
  records         = [each.value.resource_record_value]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "regional" {
  certificate_arn         = aws_acm_certificate.regional.arn
  validation_record_fqdns = [for r in aws_route53_record.regional_cert_validation : r.fqdn]
}

# ═══════════════════════════════════════════════════════════════
# Networking
# ═══════════════════════════════════════════════════════════════

module "vpc" {
  source      = "../../modules/vpc"
  name_prefix = local.name_prefix

  vpc_cidr_block        = "10.10.0.0/16"
  az_a                  = "${local.aws_region}a"
  az_b                  = "${local.aws_region}b"
  public_subnet_a_cidr  = "10.10.1.0/24"
  public_subnet_b_cidr  = "10.10.2.0/24"
  private_subnet_a_cidr = "10.10.10.0/24"
  private_subnet_b_cidr = "10.10.11.0/24"

  create_nat_gateway               = true
  create_s3_gateway_endpoint       = false
  create_dynamodb_gateway_endpoint = false
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${local.name_prefix}-ecs-tasks"
  description = "Allow ALB to reach ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = local.app_port
    to_port         = local.app_port
    protocol        = "tcp"
    security_groups = [module.alb.alb_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ═══════════════════════════════════════════════════════════════
# Load Balancer
# ═══════════════════════════════════════════════════════════════

module "alb_target_web" {
  source            = "../../modules/alb_target"
  name_prefix       = local.name_prefix
  service_name      = "web"
  vpc_id            = module.vpc.vpc_id
  port              = local.app_port
  protocol          = "HTTP"
  health_check_path = "/api/health"
}

module "alb" {
  source            = "../../modules/alb"
  name_prefix       = local.name_prefix
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  certificate_arn   = aws_acm_certificate_validation.regional.certificate_arn

  default_forward_target_group_arn = module.alb_target_web.arn
  enable_deletion_protection       = false # dev only
}

# ═══════════════════════════════════════════════════════════════
# Container Infrastructure
# ═══════════════════════════════════════════════════════════════

module "ecr_web" {
  source          = "../../modules/ecr"
  name            = "${local.name_prefix}-web"
  retention_count = 5
}

module "logs_web" {
  source            = "../../modules/cloudwatch_log"
  name_prefix       = local.name_prefix
  name              = "ecs/web"
  retention_in_days = 7
}

module "ecs_cluster" {
  source      = "../../modules/ecs_cluster"
  name_prefix = local.name_prefix
}

# ═══════════════════════════════════════════════════════════════
# Secrets Manager — created manually, referenced by ARN only
# ═══════════════════════════════════════════════════════════════

data "aws_secretsmanager_secret" "web" {
  name = "merlynn/${local.env}/web"
}

# ═══════════════════════════════════════════════════════════════
# ECS Service
# ═══════════════════════════════════════════════════════════════

module "ecs_web" {
  source         = "../../modules/ecs_service"
  name_prefix    = local.name_prefix
  service_prefix = "${local.name_prefix}-web"
  cluster_arn    = module.ecs_cluster.cluster_arn
  subnet_ids     = module.vpc.private_subnet_ids
  security_group_ids = [aws_security_group.ecs_tasks.id]
  log_group_name = module.logs_web.log_group_name

  container = {
    image  = "${module.ecr_web.repository_url}:dev-latest"
    port   = local.app_port
    cpu    = 256
    memory = 512
    environment = {
      NODE_ENV        = "production"
      PORT            = tostring(local.app_port)
      NEXTAUTH_URL    = "https://app.${local.root_domain}"
      AUTH_TRUST_HOST = "true"
    }
    secrets = [
      {
        name      = "MONGODB_URI"
        valueFrom = "${data.aws_secretsmanager_secret.web.arn}:MONGODB_URI::"
      },
      {
        name      = "AUTH_SECRET"
        valueFrom = "${data.aws_secretsmanager_secret.web.arn}:AUTH_SECRET::"
      },
    ]
  }

  load_balancer = {
    target_group_arn = module.alb_target_web.arn
    container_port   = local.app_port
  }

  secrets_arns = [data.aws_secretsmanager_secret.web.arn]

  task_inline_policy_json = data.aws_iam_policy_document.ecs_task_policy.json

  desired_count = 1
}

data "aws_iam_policy_document" "ecs_task_policy" {
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [data.aws_secretsmanager_secret.web.arn]
  }
}

# ═══════════════════════════════════════════════════════════════
# Static Sites (CloudFront + S3)
# ═══════════════════════════════════════════════════════════════

resource "aws_cloudfront_function" "spa_rewrite" {
  name    = "${local.name_prefix}-spa-rewrite"
  runtime = "cloudfront-js-2.0"
  publish = true

  code = <<-EOF
    function handler(event) {
      var request = event.request;
      var uri = request.uri;
      if (uri.endsWith('/')) {
        request.uri += 'index.html';
      } else if (!uri.includes('.')) {
        request.uri += '/index.html';
      }
      return request;
    }
  EOF
}

# ─── Storybook ────────────────────────────────────────────
module "s3_storybook" {
  source           = "../../modules/s3"
  bucket_name      = "${local.name_prefix}-storybook"
  enforce_ssl_only = false
}

module "cloudfront_storybook" {
  source                         = "../../modules/cloudfront_s3_oac"
  name_prefix                    = "${local.name_prefix}-storybook"
  s3_bucket_regional_domain_name = module.s3_storybook.bucket_regional_domain_name
  s3_bucket_id                   = module.s3_storybook.bucket_id
  s3_bucket_arn                  = module.s3_storybook.bucket_arn
  aliases                        = ["storybook.${local.root_domain}"]
  acm_certificate_arn            = module.acm_certs.cloudfront_cert_arn
  default_root_object            = "index.html"
  enable_spa_fallback            = false
  viewer_request_function_arn    = aws_cloudfront_function.spa_rewrite.arn
}

# ─── Email Previews ───────────────────────────────────────
module "s3_emails" {
  source           = "../../modules/s3"
  bucket_name      = "${local.name_prefix}-emails"
  enforce_ssl_only = false
}

module "cloudfront_emails" {
  source                         = "../../modules/cloudfront_s3_oac"
  name_prefix                    = "${local.name_prefix}-emails"
  s3_bucket_regional_domain_name = module.s3_emails.bucket_regional_domain_name
  s3_bucket_id                   = module.s3_emails.bucket_id
  s3_bucket_arn                  = module.s3_emails.bucket_arn
  aliases                        = ["emails.${local.root_domain}"]
  acm_certificate_arn            = module.acm_certs.cloudfront_cert_arn
  default_root_object            = "index.html"
  enable_spa_fallback            = false
  viewer_request_function_arn    = aws_cloudfront_function.spa_rewrite.arn
}

# ═══════════════════════════════════════════════════════════════
# DNS
# ═══════════════════════════════════════════════════════════════

# ─── dev.merlynn.co.za → ALB ──────────────────────────────
resource "aws_route53_record" "app" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "app.${local.root_domain}"
  type    = "A"

  alias {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = true
  }
}

# ─── dev-storybook.merlynn.co.za → CloudFront ─────────────
resource "aws_route53_record" "storybook" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "storybook.${local.root_domain}"
  type    = "A"

  alias {
    name                   = module.cloudfront_storybook.distribution_domain_name
    zone_id                = module.cloudfront_storybook.hosted_zone_id
    evaluate_target_health = false
  }
}

# ─── dev-emails.merlynn.co.za → CloudFront ────────────────
resource "aws_route53_record" "emails" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "emails.${local.root_domain}"
  type    = "A"

  alias {
    name                   = module.cloudfront_emails.distribution_domain_name
    zone_id                = module.cloudfront_emails.hosted_zone_id
    evaluate_target_health = false
  }
}
