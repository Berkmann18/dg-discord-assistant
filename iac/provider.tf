terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = ">=2.0"
    }
  }
}
provider "digitalocean" {
  token = var.do_token
}

data "digitalocean_ssh_key" "xux7" {
  name = "xux7"
  # public_key = var.pub_key
}