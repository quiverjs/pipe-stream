
"use strict"

var pipeStream = function(readStream, writeStream, callback) {
  if(!callback) callback = function() { }
  var self = { }

  readStream.acquireOwnership(self)
  writeStream.acquireOwnership(self)

  var doPipe = function() {
    writeStream.prepareWrite(function(streamClosed, writer) {
      if(streamClosed) {
        readStream.closeRead(streamClosed.err)
        callback(streamClosed.err)
        return
      }

      readStream.read(function(streamClosed, data) {
        if(streamClosed) {
          writer(streamClosed)
          callback(streamClosed.err)
        } else {
          writer(null, data)
          doPipe()
        }
      })
    })
  }

  doPipe()
  return self
}

module.exports = {
  pipeStream: pipeStream
}