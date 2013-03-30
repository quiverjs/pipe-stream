
var pipeStream = function(readStream, writeStream, callback) {
  if(!callback) callback = function() { }
  var self = { }

  readStream.acquireOwnership(self)
  writeStream.acquireOwnership(self)

  var doCallback = function(err) {
    if(callback) {
      process.nextTick(function() {
        var _callback = callback
        callback = null
        _callback(err)
      })
    }
  }

  var doPipe = function() {
    writeStream.prepareWrite(function(writeClosed, writer) {
      if(writeClosed) {
        readStream.closeRead(writeClosed.err)
        doCallback(writeClosed.err)
        return
      }

      readStream.read(function(streamClosed, data) {
        if(streamClosed) {
          writer(streamClosed)
          doCallback(streamClosed.err)
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