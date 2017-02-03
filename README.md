## `ArrayBuffer` Neuter

Remove the underlying data from an `ArrayBuffer` and free the memory manually.
For safety, only `ArrayBuffer`s that have not been externalized can be
neutered.


### Install

```
$ npm install ab-neuter
```

### Usage

```js
const neuter = require('ab-neuter');
const net = require('net');

net.createServer((c) => {
  c.on('data', (chunk) => {
    // Perform operation on the Buffer, then manually free the memory.
    neuter(chunk);
  });
}).listen();
```
