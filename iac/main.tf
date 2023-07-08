resource "digitalocean_droplet" "dg_discord_assistant" {
  image              = "ubuntu-20-04-x64"
  name               = var.project
  region             = var.region
  size               = "s-1vcpu-1gb"
  backups            = true
  monitoring         = true
  ssh_keys = [
    data.digitalocean_ssh_key.xux7.id
  ]

  connection {
    host        = self.ipv4_address
    user        = "root"
    type        = "ssh"
    private_key = file(var.pvt_key)
    timeout     = "2m"
  }

  user_data = "#cloud-config\npackage_update: true\npackage_upgrade: true"

  provisioner "remote-exec" {
    inline = [
      "sudo apt update -y && sudo apt upgrade -y",
      # "curl -sL https://deb.nodesource.com/setup_19.x -o nodesource_setup.sh"
      # "sudo apt install nodejs npm -y",
      "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash",
      "source /root/.bashrc",
      "nvm install node",
      "git clone https://github.com/Berkmann18/dg-discord-assistant.git"]

    connection {
      host        = self.ipv4_address
      type        = "ssh"
      user        = "root"
      private_key = file(var.pvt_key)
    }
  }

  tags = ["DG-Discord"]
}