'use strict'
var fs = require('fs')
var https = require('https')
var moment = require('moment')
var request = require('superagent')
var transform = require('./transform').transform

var opts = {
  host: '192.168.99.100',
  port: process.env.DOCKER_PORT || 2376,
  path: '/events', 
  ca: fs.readFileSync('/Users/bh/.docker/machine/machines/default/ca.pem'),
  cert: fs.readFileSync('/Users/bh/.docker/machine/machines/default/cert.pem'),
  key: fs.readFileSync('/Users/bh/.docker/machine/machines/default/key.pem')
}

https.request(opts, function(res) {
  res.pipe(transform(function(chunk, done) {
      let str = chunk.toString()
      let obj = JSON.parse(str)
      let plucked = dissoc(obj, 'timeNano')
      sendEventToSlack(plucked)
      done()
  }))
}).end();

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
    username: "webhookbot", 
    text: msg,
    icon_emoji: ":ghost"
  }
}

function sendEventToSlack(obj) {
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
      console.log(res.text)
    })
}

