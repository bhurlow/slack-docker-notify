# slack docker notify

stream events from docker to your slack `#notifications` channel 
<img style="width:600px;" src="https://raw.githubusercontent.com/bhurlow/slocker/master/pic.png" />

### Usage

```
docker run -d \
  -e SLACK_WEBHOOK_URL $SLACK_WEBHOOK_URL \
  bhurlow/slack-docker-notify 
```


