'use strict';

const fork = require('child_process').fork;
const neuter = require('../main');
const net = require('net');
const port = parseInt(process.argv[2]);
const child_list = [];
const packet_size = 64 * 1024;
let child_count = 4;

if (!Number.isNaN(port)) {
  const data = Buffer.alloc(packet_size, Math.random().toString(36));
  let packet_count = 300000;

  const connection = net.connect(port, () => {
    (function writeData() {
      if (--packet_count <= 0) return connection.end(data);
      connection.write(data, writeData);
    })();
  });
  return;
}


const should_neuter = !(process.argv[2] === 'no-neuter');
let bytes_read = 0;
let packets_received = 0;

net.createServer((c) => {
  c.on('data', (chunk) => {
    bytes_read += chunk.length;
    packets_received++;
    // Perform operation on the Buffer, then manually free the memory. 
    if (should_neuter) neuter(chunk);
  });
}).listen(function() {
  const server_port = this.address().port;
  for (var i = 0; i < child_count; i++) {
    child_list.push(fork(__filename, [ server_port ]).on('close', () => {
      if (--child_count === 0) this.close();
    }));
  }
  setTimeout(printBytesRead, 3000);
});


function printBytesRead() {
  if (bytes_read <= 0) return;
  prints(`${bytes_read / 1024} kB   ${packets_received} packets`);
  bytes_read = 0;
  packets_received = 0;
  setTimeout(printBytesRead, 3000);
}


function prints() {
  const writeSync = require('fs').writeSync;
  const inspect = require('util').inspect;
  const args = arguments;
  for (let i = 0; i < args.length; i++) {
    const arg = typeof args[i] === 'string' ? args[i] : inspect(args[i]);
    writeSync(1, arg);
  }
  writeSync(1, '\n');
};
