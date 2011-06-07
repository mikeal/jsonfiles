var jsonfiles = require('../main')
  , path = require('path')
  ;
  
var db = jsonfiles.createDatabase(path.join(__dirname, 'test.db'))
  ;

db.clone('http://mikeal.iriscouch.com/mikeal', function (e, r) {
  console.log(r)
})