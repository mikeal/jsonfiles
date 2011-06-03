var jsonfiles = require('../main')
  , path = require('path')
  , fs = require('fs')
  , exec = require('child_process').exec
  ;

exec('rm -rf ' + path.join(__dirname, 'test.db'), function (error, stdout, stderr) {  
  var db = jsonfiles.createDatabase(path.join(__dirname, 'test.db'))
  
  db.put({_id:'testdoc1'}, function (e, info) {
    if (e) throw e;
    console.log(info)
    db.put({_id:'testdoc1', _rev:info.rev}, function (e, info) {
      console.log(info)
    })
  })
})
  
