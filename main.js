var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , events = require('events')
  , request = require('request')
  , uuid = require('node-uuid')
  ;

function bumprev (oldrev) {
  var i = parseInt(oldrev.slice(0, oldrev.indexOf('-')))
  if (!isNaN(i)) return (i + 1) + '-' + uuid()
  return '1-' + uuid()
}

function Database (directory) {
  this._root = directory;
  try {
    if (!fs.statSync(directory).isDirectory()) throw 'not directory'
  } catch(e) {
    fs.mkdirSync(directory, 0777)
  }
}
util.inherits(Database, events.EventEmitter);
Database.prototype.list = function (filter, cb) {
  if (!cb) {
    cb = filter
    filter = null
  }
  fs.listdir(this._root, function (error, files) {
    if (error) return cb(error)
    var r = files.map(function (i) {
      if (i.slice(i.length - 5) === '.json') {
        i = i.slice(i.length - 5)
        if (filter && filter(i)) return i
        else return i
      }
    })
    cb(null, r)
  })
}
Database.prototype.get = function (key, cb) {
  fs.readFile(path.join(this._root, key+'.json'), function (error, buffer) {
    if (error) return cb(error)
    cb(null, JSON.parse(buffer.toString()))
  })
}
Database.prototype.put = function (obj, cb) {
  var self = this;
  if (!obj._id) {
    obj._id = uuid()
  }
  self.get(obj._id, function (error, oldobj) {
    if (error) {
      if (!obj._rev) obj._rev = '1-' + uuid()
      else obj._rev = bumprev(obj._rev)
      fs.writeFile(path.join(self._root, obj._id+'.json'), JSON.stringify(obj, null, 2), function (error, s) {
        self.emit('update', obj)
        if (error) return cb(error)
        cb(null, {id:obj._id, rev:obj._rev})
      })
    } else {
      if (obj._rev !== oldobj._rev) return cb(new Error('revision conflict.'))
      obj._rev = bumprev(obj._rev)
      fs.writeFile(path.join(self._root, obj._id+'.json'), JSON.stringify(obj, null, 2), function (error, s) {
        self.emit('update', obj)
        if (error) return cb(error)
        cb(null, {id:obj._id, rev:obj._rev})
      })
    }
  })
}
Database.prototype.pullCouchDB = function (url, cb) {
  var self = this
  if (url[url.length - 1] !== '/') url += '/'
  request(url+'_all_docs?include_docs=true', function (e, resp, body) {
    var counter = 0
      , results = []
      ;
    JSON.parse(body).rows.forEach(function (row) {
      counter++
      self.put(row.doc, function (e, info) {
        if (e) results.push({doc:row.doc, error:e})
        else results.push(info)
        counter--
        if (counter === 0) {
          cb(null, results)
        } 
      })
    })
  })
}

  
exports.createDatabase = function (directory) {
  return new Database(directory)
}


