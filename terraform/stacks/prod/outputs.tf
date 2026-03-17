output "ecr_web_url" {
  description = "ECR repository URL — used in CI/CD to push images"
  value       = module.ecr_web.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name — used in CI/CD to deploy"
  value       = module.ecs_cluster.cluster_name
}

output "ecs_web_service_name" {
  description = "ECS service name — used in CI/CD to force new deployment"
  value       = module.ecs_web.service_name
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.alb_dns_name
}

output "app_url" {
  description = "Application URL"
  value       = "https://prod-app.${local.root_domain}"
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "logs_web_group" {
  value = module.logs_web.log_group_name
}

output "storybook_url" {
  description = "Storybook URL"
  value       = "https://prod-storybook.${local.root_domain}"
}

output "storybook_bucket" {
  description = "Storybook S3 bucket — used in CI/CD to sync static build"
  value       = module.s3_storybook.bucket_id
}

output "storybook_distribution_id" {
  description = "Storybook CloudFront distribution — invalidate after deploy"
  value       = module.cloudfront_storybook.distribution_id
}

output "emails_url" {
  description = "Email previews URL"
  value       = "https://prod-emails.${local.root_domain}"
}

output "emails_bucket" {
  description = "Email previews S3 bucket"
  value       = module.s3_emails.bucket_id
}

output "emails_distribution_id" {
  description = "Email previews CloudFront distribution"
  value       = module.cloudfront_emails.distribution_id
}
