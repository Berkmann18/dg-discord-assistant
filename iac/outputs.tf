output "Status" {
  value = digitalocean_droplet.dg_discord_assistant.status
}

output "Tags" {
  value = digitalocean_droplet.dg_discord_assistant.tags
}

output "IPv4" {
  value     = digitalocean_droplet.dg_discord_assistant.ipv4_address
  sensitive = true # var.redact_info
}