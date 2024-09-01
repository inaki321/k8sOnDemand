variable "project_id" {
  type = string
  default = "testing-id"
}

variable "region" {
  type = string
  default = "us-central1"
}

variable "environments" {
  type    = list(string)
  default = ["devel", "prod"]
}