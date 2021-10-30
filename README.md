# PlantUML Editor

> A Vue.js, Vuex project

![PlantUML Editor](public/static/favicon-60.png)　PlantUML online demo client

![PlantUML Editor](public/static/capture1_20170809.png)

## Support

https://powerplantuml.atlassian.net/jira/servicedesk/projects/POW

support@powerplantuml.atlassian.net

## Features

- multiple PlantUML templates
- cheat sheet
- snippet
- zoom & scroll
- supports SVG & PNG
- save texts
- create gists
- support markdown
- download image
- print HTML

## Build Setup

### Prerequisites

```bash
# Install nodejs 10
export NODE_RELEASE="node-v10.24.1-linux-x64"
wget "https://nodejs.org/dist/latest-v10.x/$NODE_RELEASE.tar.gz"
tar -xzf "$NODE_RELEASE.tar.gz"
rm -f "$NODE_RELEASE.tar.gz"
export PATH="$PWD/$NODE_RELEASE/bin:$PWD/node_modules/.bin:$PATH"
```

### Set environment

```bash
# local dev env
export BASEURL='https://3f62d445.ngrok.io'
export FUNCTION_BASEURL='https://3f62d445.ngrok.io'
# test env
npm run firebase use test
export BASEURL='https://powerplantuml-test.firebaseapp.com'
export FUNCTION_BASEURL='https://us-central1-powerplantuml-test.cloudfunctions.net'
# prod env
npm run firebase use default
export BASEURL='https://powerplantuml.firebaseapp.com'
export FUNCTION_BASEURL='https://us-central1-powerplantuml.cloudfunctions.net'

# Generate atlassian-connect.json
cat atlassian-connect.tmpl.json | envsubst > atlassian-connect.json
```

## Build, deploy, etc

```bash

# install dependencies
npm install --also=dev

npm run flow-typed

# build for production with minification
npm run build

# run unit tests
npm run test:unit

# run e2e tests
npm run e2e

# Deploy to firebase
# Make sure you set the right environment variables and generated atlassian-connect.json!
rm -fr dist/
npm run build
npm run firebase deploy
```

## Run locally

```bash
# If you get the error
#   Error: ENOSPC: System limit for number of file watchers reached
# echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

# serve with hot reload at localhost:8080
npm run serve

# Run with ngrok
npm run dev
./ngrok http --host-header=rewrite 8080 
```

## Renderer

### Install with systemd

```bash
apt update
apt upgrade

#
# Install Plantuml server under systemd
#

apt install maven

git clone --depth 1 https://github.com/plantuml/plantuml-server.git
mv plantuml-server /opt/plantuml-server
adduser plantuml
adduser plantuml plantuml
chown -R plantuml.plantuml /opt/plantuml-server


cat > /etc/systemd/system/plantuml-server.service <<EOF
[Unit]
Wants=network-online.target
After=network-online.target

[Service]
ExecStart=mvn jetty:run -Djetty.port=9999 -Djetty.contextpath=/
WorkingDirectory=/opt/plantuml-server
Restart=always

User=plantuml
Group=plantuml

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable plantuml-server
systemctl start plantuml-server
systemctl status plantuml-server

#
# Install nginx server under systemd
#


apt install nginx
# Note: Certbot will configure TLS 443
cat <<EOF > /etc/nginx/sites-available/render.powerplantuml.com
server {
    listen 80;
    listen [::]:80;
    server_name render.powerplantuml.com;
    location / {
        proxy_pass http://localhost:9999;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/render.powerplantuml.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

apt install certbot python3-certbot-nginx
certbot --nginx -d powerplantuml.com -d render.powerplantuml.com
systemctl status certbot.timer
certbot renew --dry-run

#
# Install monit
#


apt install monit
systemctl enable monit
systemctl start monit

cat <<EOF > /etc/monit/conf-available/http
set httpd port 2812 and
    use address localhost  # only accept connection from localhost (drop if you use M/Monit)
    allow localhost        # allow localhost to connect to the server and
    allow admin:monit      # require user 'admin' with password 'monit'
    #with ssl {            # enable SSL/TLS and set path to server certificate
    #    pemfile: /etc/ssl/certs/monit.pem
    #}
EOF
ln -s /etc/monit/conf-available/http /etc/monit/conf-enabled/

cat <<EOF > /etc/monit/conf-available/plantuml-server
check host plantuml-server with address 127.0.0.1
    start program = "/usr/bin/systemctl start plantuml-server"
    stop program  = "/usr/bin/systemctl stop plantuml-server"
    # alert alerts@example.com on {timeout,connection}
    if failed port 9999 protocol HTTP
      request /png/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000
      with timeout 3 seconds
      then restart
    if 10 restarts within 10 cycles then timeout

EOF
ln -s /etc/monit/conf-available/plantuml-server /etc/monit/conf-enabled/

monit reload
monit status

```

#### Update

```bash
systemctl stop plantuml-server.service
systemctl stop monit

cd /opt/plantuml-server/
git pull

systemctl start plantuml-server.service
journalctl -f -u plantuml-server
systemctl status plantuml-server

systemctl start monit
```

### Install with Docker

```bash
apt update
apt upgrade

apt install docker.io

cat <<EOF > Dockerfile
FROM plantuml/plantuml-server:tomcat
RUN apt  update && apt install -y curl
HEALTHCHECK CMD curl --fail http://localhost:8080/uml/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000 || exit 1 
EOF
docker build -t powerplantuml-server .
# docker run -d --restart always --health-cmd 'curl --fail http://localhost:8080/uml/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000' \
#    --health-interval 10s --health-start-period 1m --health-timeout 15s -p 8080:8080 plantuml/plantuml-server:tomcat
# docker run -d --restart always -p 8080:8080 plantuml/plantuml-server:tomcat
docker run -d --restart always -p 8080:8080 powerplantuml-server
curl -v http://localhost:8080

apt install nginx
# Note: Certbot will configure TLS 443
cat <<EOF > /etc/nginx/sites-available/render.powerplantuml.com
server {
    listen 80;
    listen [::]:80;
    server_name render.powerplantuml.com;
    location / {
        proxy_pass http://localhost:8080;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/render.powerplantuml.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

apt install certbot python3-certbot-nginx
certbot --nginx -d powerplantuml.com -d render.powerplantuml.com
systemctl status certbot.timer
certbot renew --dry-run

```
docker run -d -p 4000:8080 plantuml/plantuml-server:jetty
```

> **Notice:** The specification of the port number follows `.env.development`

## Other

Pen graphic by [freepik](http://www.flaticon.com/authors/freepik) from [Flaticon](http://www.flaticon.com/) is licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/). Check out the new logo that I created on [LogoMaker.com](http://logomakr.com) https://logomakr.com/7Gn1Ck







# Deployment

## PlantUML Rendering Server

### Install gcloud

```
# Install gcloud. Only do this once
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get install apt-transport-https ca-certificates gnupg
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get update && sudo apt-get install google-cloud-sdk
gcloud init
gcloud auth configure-docker
```

### Update PlantUML server Docker image on Google Artifact Registry

```
# If you aren't authenticated, log in to gcloud
# gcloud auth login

# PowerPlantUML Test
PROJECT_ID=powerplantuml-test
# PowerPlantUML (production)
# PROJECT_ID=powerplantuml

gcloud config set project ${PROJECT_ID}

docker pull plantuml/plantuml-server:latest
docker tag plantuml/plantuml-server:latest gcr.io/${PROJECT_ID}/plantuml/plantuml-server:latest
docker push gcr.io/${PROJECT_ID}/plantuml/plantuml-server:latest
```

### Deploy PlantUML render server on Google Run

```
```

