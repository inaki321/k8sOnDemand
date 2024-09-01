provider "google" {
  project = var.project_id
  region  = var.region
}

# Cluster creation, devel and prod 
resource "google_container_cluster" "primary" {
  for_each = toset(var.environments)

  name     = "${each.key}-gke-cluster"
  location = var.region

  initial_node_count = 1

  # Define the node pools
  node_pool {
    name       = "controller-pool"
    node_count = 1

    node_config {
      machine_type = "e2-medium"
      oauth_scopes = [
        "https://www.googleapis.com/auth/devstorage.read_only",
        "https://www.googleapis.com/auth/logging.write",
        "https://www.googleapis.com/auth/monitoring",
        "https://www.googleapis.com/auth/servicecontrol",
        "https://www.googleapis.com/auth/service.management.readonly",
        "https://www.googleapis.com/auth/trace.append",
      ]
    }
  }

  node_pool {
    name       = "worker-pool"
    node_count = 2

    node_config {
      machine_type = "e2-medium"
      oauth_scopes = [
        "https://www.googleapis.com/auth/devstorage.read_only",
        "https://www.googleapis.com/auth/logging.write",
        "https://www.googleapis.com/auth/monitoring",
        "https://www.googleapis.com/auth/servicecontrol",
        "https://www.googleapis.com/auth/service.management.readonly",
        "https://www.googleapis.com/auth/trace.append",
      ]
    }
  }
}

# firewall to login
resource "google_compute_firewall" "default" {
  for_each = toset(var.environments)

  name    = "${each.key}-gke-cluster-allow-external"
  network = "default"

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
}