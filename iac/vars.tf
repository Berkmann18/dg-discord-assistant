variable "do_token" {
  description = "DigitalOcean API token"
}

variable "pvt_key" {}
variable "pub_key" {}

variable "region" {
  description = "DO region"
  default     = "lon1"
}

# variable "allowed_cidrs" {
#   description = "CIDR allowlist"
# }

variable "project" {
  default = "DGDiscordAssistant"
}

variable "BOT_TOKEN" {}
# variable "ROLEID" {}
# variable "CHANNELID" {}
#variable "INSTANCE" {}

variable "gh_un" {
  default = "Berkmann18"
}

variable "gh_pat" {}
