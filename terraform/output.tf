output "kubeconfig" {
  value = { for env in var.environments : env => google_container_cluster.primary[env].endpoint }
}

output "cluster_name" {
  value = { for env in var.environments : env => google_container_cluster.primary[env].name }
}

output "client_certificate" {
  value = { for env in var.environments : env => base64decode(google_container_cluster.primary[env].master_auth[0].client_certificate) }
}

output "client_key" {
  value = { for env in var.environments : env => base64decode(google_container_cluster.primary[env].master_auth[0].client_key) }
}

output "cluster_ca_certificate" {
  value = { for env in var.environments : env => base64decode(google_container_cluster.primary[env].master_auth[0].cluster_ca_certificate) }
}