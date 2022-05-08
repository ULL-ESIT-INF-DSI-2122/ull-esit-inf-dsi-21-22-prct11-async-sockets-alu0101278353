import * as net from 'net';
import { spawn } from 'child_process';
import { ResponseType } from './alias';

if (process.argv.length !== 3) {
  console.log('Please, provide a filename.');
} else {
  const fileName = process.argv[2];
  const res: ResponseType = {
    type: 'cat',
    success: true,
    txt: fileName,
  };
  
  net.createServer((connection) => {
    console.log('Un cliente se ha conectado');

    connection.write(JSON.stringify(res) +
      '\n');
      // Process
      connection.on('data', () => {
        const cat = spawn('cat', [fileName]);
        cat.stdout.pipe(process.stdout);
      });
      connection.on('end', () => {
        clearTimeout(3000);
        console.log('mensaje terminado');
      });

      connection.on('close', () => {
        console.log('Un cliente se ha desconectado.');
      });
    }).listen(60300, () => {
      console.log('Esperando clientes.');
    });
}