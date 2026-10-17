# PowerPlantUML

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

## Support

https://powerplantuml.atlassian.net/jira/servicedesk/projects/POW

support@powerplantuml.atlassian.net

## Development

### Standards

- All development is done on branch `atlassian-connect`
- Branch `master` is used to pull upstream changes
- Always bump version in `atlassian-connect.tmpl.json` before deploying

### Catch up to upstream

```
git pull upstream master
```

### Merge upstream into development branch

```
git checkout atlassian-connect
git merge master
```

## Build Setup

### Install supported Node

Use Node.js 22 for the frontend build, Firebase CLI, and Cloud Functions.
The functions explicitly use the first-generation Firebase API.

```bash
nvm install
nvm use

# Install dependencies in all three packages
npm ci
(cd functions && npm ci)
(cd hosting && npm ci)
```

Install [`cloudflared`](https://developers.cloudflare.com/pages/how-to/preview-with-cloudflare-tunnel/).

## Local development

Run commands from the repository root. For a frontend preview, start the tunnel
in terminal 1 and leave it running:

```bash
cloudflared tunnel --url http://localhost:8080 --http-host-header localhost:8080
```

In terminal 2, paste the printed `https://...trycloudflare.com` URL:

```bash
export BASEURL='https://...trycloudflare.com'
export MACRO_KEY=power-plant-uml-dev MACRO_NAME='PowerPlantUML Dev'
npm run build:descriptor
npm --prefix hosting run serve:app -- --port 8080
```

Open $BASEURL in browser to preview the editor.

## Local test

Expose Firebase Hosting and its function rewrites through one tunnel. Terminal 1:

```bash
cloudflared tunnel --url http://localhost:5000
```

Terminal 2 (use a test PostgreSQL database):

```bash
export BASEURL='https://...trycloudflare.com'
export POSTGRES_URL="postgres://postgres:$PASSWORD@$HOSTIP/powerplantuml"
export NODE_ENV=production
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/google-cloud-credentials.json"
export MACRO_KEY=power-plant-uml-test 
export MACRO_NAME='PowerPlantUML Test'
npm run build
npm run serve -- --project powerplantuml-test --only hosting,functions
```

Note: run `npx firebase login` if you get a warning.

In Confluence **Manage apps → Upload app**, enter
`$BASEURL/atlassian-connect.json`.
When the tunnel URL changes, rebuild, restart the emulators, and reinstall the test app.

Run automated tests in another terminal:

```bash
npm --prefix hosting run test:unit -- --runInBand
PORT=8081 npm --prefix hosting run test:e2e -- --headless
```

## Integration Testing

```bash
export NODE_ENV=production
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/google-cloud-credentials.json"

export BASEURL='https://powerplantuml-test.firebaseapp.com'
export FUNCTION_BASEURL='https://us-central1-powerplantuml-test.cloudfunctions.net'
export POSTGRES_URL="postgres://postgres:$PASSWORD@$HOSTIP/powerplantuml"
export MACRO_KEY="power-plant-uml-test"
export MACRO_NAME="PowerPlantUML Test"

# Build and deploy explicitly to test, regardless of Firebase's active/default project.
# Environment variables above configure the app, not the deployment target.
npm run deploy -- --project powerplantuml-test

# Go side load test version in Confluence
# - Go to https://powerplantuml.atlassian.net/wiki/plugins/servlet/upm
# - Click Upload App button
# - Enter https://powerplantuml-test.firebaseapp.com/atlassian-connect.json
```

## Production deployment

```bash
export NODE_ENV=production
export BASEURL='https://powerplantuml.firebaseapp.com'
export FUNCTION_BASEURL='https://us-central1-powerplantuml.cloudfunctions.net'
export MACRO_KEY="power-plant-uml"
export MACRO_NAME="PowerPlantUML"
export POSTGRES_URL="postgres://postgres:$PASSWORD@$HOSTIP/powerplantuml"

# Build and deploy to Firebase
npm run deploy
```

## Renderer

The standard PlantUML server is used for rendering. This section describes how to install and update it.

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

```bash
docker pull plantuml/plantuml-server:jetty
docker restart powerplantuml-server
```

## Credits

Pen graphic by [freepik](http://www.flaticon.com/authors/freepik) from [Flaticon](http://www.flaticon.com/) is licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/). Check out the new logo that I created on [LogoMaker.com](http://logomakr.com) https://logomakr.com/7Gn1Ck

