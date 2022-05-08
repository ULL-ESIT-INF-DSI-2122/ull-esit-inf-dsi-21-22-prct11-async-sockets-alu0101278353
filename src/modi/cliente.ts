import * as net from 'net';

const client = net.connect({port: 60300});

let wholeData = '';
client.on('data', (dataChunk) => {
  wholeData += dataChunk;
});

client.on('end', () => {
  const message = JSON.parse(wholeData);
  if (message.type === 'cat') {
    console.log(`Conección establecida: listando el fichero ${message.txt}`);
  } else {
    console.log(`Message type ${message.type} is not valid`);
  }
});