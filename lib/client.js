/**
 * Script injected in the client entry file
 * which need to be written in es5 for compability
 */

/* eslint-disable */
var io = require('socket.io-client')

var client = io.connect('/')

var log = function (str) {
  console.log('[sio]', str)
}

client.on('connect', function () {
  log('connected.')
})

client.on('compile-done', function () {
  log('reloading...')
  window.location = window.location
})

client.on('compile-fail', function () {
  log('compilation failed!')
})

client.on('rebuilding', function () {
  log('modules rebuilding...')
})
