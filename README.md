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
npm run deploy
```

## Run locally

```bash
# If you get the error
#   Error: ENOSPC: System limit for number of file watchers reached
# echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

# Run ngrok
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
unzip ngrok-stable-linux-amd64.zip
./ngrok http --host-header=rewrite 8080 

# serve with hot reload at localhost:8080
npm run dev
```

## Renderer

### Install

```bash
apt update
apt upgrade

#
# Install PlantUML rendering server under Docker
#

apt install docker.io
docker run -d --name=plantuml-server -e 'ALLOW_PLANTUML_INCLUDE=true' --restart always -p 8080:8080 plantuml/plantuml-server:jetty --module=http-forwarded
curl -v http://localhost:8080

#
# Install nginx
#

apt install nginx
# Note: Certbot will configure TLS 443
cat <<EOF > /etc/nginx/sites-available/render.powerplantuml.com
server {
    listen 80;
    listen [::]:80;
    server_name render.powerplantuml.com;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    location / {
        proxy_pass http://localhost:8080;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/render.powerplantuml.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

#
# Configure HTTPS
#

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
    # start program = "/usr/bin/systemctl start plantuml-server"
    # stop program  = "/usr/bin/systemctl stop plantuml-server"
    start program = "/usr/bin/docker start plantuml-server"
    stop program  = "/usr/bin/docker stop plantuml-server"
    # alert alerts@example.com on {timeout,connection}
    if failed port 8080 protocol HTTP
      request /png/SyfFKj2rKt3CoKnELR1Io4ZDoSa70000
      with timeout 3 seconds
      then restart
    if 10 restarts within 10 cycles then timeout

EOF
ln -s /etc/monit/conf-available/plantuml-server /etc/monit/conf-enabled/

monit reload
monit status
```

### Update

docker pull plantuml/plantuml-server:jetty
docker restart powerplantuml-server


## Other

Pen graphic by [freepik](http://www.flaticon.com/authors/freepik) from [Flaticon](http://www.flaticon.com/) is licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/). Check out the new logo that I created on [LogoMaker.com](http://logomakr.com) https://logomakr.com/7Gn1Ck


