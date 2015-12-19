'use strict'
var debug = require('debug')('slack-docker-notify')
var fs = require('fs')
var https = require('https')
var moment = require('moment')
var request = require('superagent')
var Docker = require('dockerode')

var docker = new Docker({socketPath: '/tmp/docker.sock'});

var ev = docker.getEvents(function(e, r) {
  r.on('data', function(d) {
    let event = d.toString()
    event = JSON.parse(event)
    sendEventToSlack(event)
  })
})

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
  let url = process.env.SLACK_WEBHOOK_URL
  if (!url)  return debug('must set $SLACK_WEBHOOK_URL env var') 
  let opts = {
    hostname: process.env.SLACK_WEBHOOK_URL,
    method: 'POST', 
  }
  let msg = formatDockerEvent(obj)
  let payload = makeBody(msg)
  request
    .post(process.env.SLACK_WEBHOOK_URL)
    .send(payload)
    .set('Accept', 'application/json')
    .end(function(err, res) {
      debug('slack responded: %s %s', res.status, res.text)
    })
}

