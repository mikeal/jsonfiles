# jsonfiles -- Simple flat file database holding JSON objects

## Install

From source:

<pre>
  npm install jsonfiles
</pre>

## jsonfiles and CouchDB

jsonfiles has revision checks like CouchDB and holds it's _id and _rev attributes the same way CouchDB does. jsonfiles is only slightly durable, it is not designed to be used in an environment with write concurrency.

jsonfiles can "clone" a CouchDB database. It cannot "replicate" as it does not have a by-sequence index or hold previous revision information.

## API

#### jsonfiles.createDatabase(directory)

Returns a new Database object for the given directory.

You can store other files in the same directory, all files that do not have a .json extension will be ignored.

#### Database.get(id, callback)

Get the object with the specified _id_.

_callback_ is a function that takes two arguments: _error_ and _obj_.

#### Database.put(obj, callback)

Write an object to the database. If the object does not have an _id property a random uuid will be generated for it.

If the document is current in the database the _rev attribute must match the one that is already in the database in order to update it.

_callback_ is a function that takes two arguments: _error_ and _info_. _info_ contains the id and revision information for the write.

#### Database.clone(url, callback)

Clones a CouchDB database at the given url.

_callback_ is a function that takes two arguments: _error_ and _info_. _info_ contains the id and revision information for every write.

