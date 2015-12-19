'use strict'
var debug = require('debug')('slack-docker-notify')
var fs = require('fs')
var https = require('https')
var moment = require('moment')
var request = require('superagent')
var Docker = require('dockerode')

var DOCKER_HOST = process.env.DOCKER_HOST
var DOCKER_PORT = process.env.DOCKER_PORT
var DOCKER_TLS_VERIFY = process.env.DOCKER_TLS_VERIFY
var DOCKER_CERT_PATH = process.env.DOCKER_CERT_PATH

if (DOCKER_HOST && DOCKER_TLS_VERIFY && DOCKER_CERT_PATH) {
  debug('starting http connect to docker at: %s', DOCKER_HOST)
  let docker = new Docker({
    host: DOCKER_HOST,
    port: DOCKER_PORT,
    ca: fs.readFileSync(DOCKER_CERT_PATH + '/ca.pem'),
    cert: fs.readFileSync(DOCKER_CERT_PATH + '/cert.pem'),
    key: fs.readFileSync(DOCKER_CERT_PATH + '/key.pem')
  });
  docker.getEvents(handleEvents)
}

else {
  let docker = new Docker({socketPath: '/tmp/docker.sock'});
  debug('starting unix socket connection to docker at: %s', '/tmp/docker.sock')
}

// util fns

function handleEvents(e, r) {
  if (e) return console.log(e)
  r.on('data', function(d) {
    let event = d.toString()
    event = JSON.parse(event)
    sendEventToSlack(event)
  })
}

function dissoc (obj, key) {
  delete obj[key]
  return obj
}

function formatDockerEvent(obj) {
  let time = moment(obj.time * 1000).format("MMM Do h:mm a")
  return `${time} => ${obj.status} ${obj.id}`
}

function makeBody(msg) {
	return {
    channel: "#notifications",
    username: "dockerbot", 
    text: msg,
    icon_emoji: ":ghost"
  }
}

function sendEventToSlack(obj) {
  debug('sending event to slack')
  let msg = formatDockerEvent(obj)
  debug(msg)
  let payload = makeBody(msg)
  let url = process.env.SLACK_WEBHOOK_URL
  if (!url)  return debug('must set $SLACK_WEBHOOK_URL env var') 
  let opts = {
    hostname: process.env.SLACK_WEBHOOK_URL,
    method: 'POST', 
  }
  request
    .post(process.env.SLACK_WEBHOOK_URL)
    .send(payload)
    .set('Accept', 'application/json')
    .end(function(err, res) {
      debug('slack responded: %s %s', res.status, res.text)
    })
}

