resource "digitalocean_droplet" "dg_discord_assistant" {
  image      = "ubuntu-20-04-x64"
  name       = var.project
  region     = var.region
  size       = "s-1vcpu-1gb"
  backups    = true
  monitoring = true
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

  provisioner "file" {
    source = "setup.sh"
    destination = "/tmp/setup.sh"
  }

  provisioner "file" {
    source = "configs/prod.json"
    destination = "/root/configs/prod.json"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/setup.sh",
      "/tmp/setup.sh"
    ]

    connection {
      host        = self.ipv4_address
      type        = "ssh"
      user        = "root"
      private_key = file(var.pvt_key)
    }
  }

  tags = ["DG-Discord"]
}