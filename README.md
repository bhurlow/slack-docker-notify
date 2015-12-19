# slack docker notify

stream events from docker to your slack `#notifications` channel 
<img style="width:600px;" src="https://raw.githubusercontent.com/bhurlow/slocker/master/pic.png" />

### Usage

for single docker hosts you can simply connect to to docker via the unix socket:

```
docker run -d \
  -e SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL \
  -v /var/run/docker.sock:/tmp/docker.sock:ro \
  --name notify \ 
  bhurlow/slack-docker-notify 
```

you may also provide a specific docker host (like a docker swarm master node):

```
docker run \
  -it \
  -e DOCKER_HOST=$(docker-machine ip default) \
  -e DOCKER_PORT=2376 \
  -e DOCKER_TLS_VERIFY=1 \
  -e DOCKER_CERT_PATH=/tmp/docker-certs  \
  -v /var/run/docker.sock:/tmp/docker.sock:ro \
  -v /tmp/docker-certs:/tmp/docker-certs \
  bhurlow/slack-docker-notify
```

**note**: when specify DOCKER_HOST etc, you must first copy over the certs to the host.
