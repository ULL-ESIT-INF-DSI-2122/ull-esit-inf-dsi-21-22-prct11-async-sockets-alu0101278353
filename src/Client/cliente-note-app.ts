import * as yargs from 'yargs';
import * as net from 'net';
import { RequestType } from '../Types/request';
import chalk = require('chalk');

export class Client {
  constructor() {}

  public start() {
    /**
     * Cliente que escucha en el puerto 60300
     */
    const client = net.connect({port: 60300});

    /**
     * Agrega una nota, y escribe en el server  el tipo de solicitud.
     */
    yargs.command({
      command: 'add',
      describe: 'Add a new note',
      builder: {
        user: {
          describe: 'Name User',
          demandOption: true,
          type: 'string',
        },
        title: {
          describe: 'Note title',
          demandOption: true,
          type: 'string',
        },
        body: {
          describe: 'Body from the note',
          demandOption: true,
          type: 'string',
        },
        color: {
          describe: 'Color from the note',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof argv.title === 'string' && typeof argv.user === 'string' && typeof argv.body === 'string' && typeof argv.color === 'string') {
          const request: RequestType = {
            type: 'add',
            user: argv.user,
            title: argv.title,
            body: argv.body,
            color: argv.color,
          };
          client.write(JSON.stringify(request)+ '\n');
        }
      },
    });

    /**
     * Elimina nota de la lista, y escribe en el server  el tipo de solicitud.
     */
    yargs.command({
      command: 'remove',
      describe: 'Delete a note',
      builder: {
        user: {
          describe: 'Name User',
          demandOption: true,
          type: 'string',
        },
        title: {
          describe: 'Note title',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof argv.title === 'string' && typeof argv.user === 'string') {
          const request: RequestType = {
            type: 'remove',
            user: argv.user,
            title: argv.title,
          };
          client.write(JSON.stringify(request)+ '\n');
        }
      },
    });

    /**
     * Lista las notas que tiene el usuario, y escribe en el server  el tipo de solicitud.
     */
    yargs.command({
      command: 'list',
      describe: 'List a note',
      builder: {
        user: {
          describe: 'Name User',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof argv.user === 'string') {
          const request: RequestType = {
            type: 'list',
            user: argv.user,
          };
          client.write(JSON.stringify(request)+ '\n');
        }
      },
    });

    /**
    * Lee el contenido de la nota del usuario, y escribe en el server el tipo de solicitud.
    */
    yargs.command({
      command: 'read',
      describe: 'Read the content of the note',
      builder: {
        user: {
          describe: 'Name User',
          demandOption: true,
          type: 'string',
        },
        title: {
          describe: 'Note title',
          demandOption: true,
          type: 'string',
        },
      },
      handler(argv) {
        if (typeof argv.user === 'string' && typeof argv.title === 'string') {
          const request: RequestType = {
            type: 'read',
            user: argv.user,
            title: argv.title,
          };
          client.write(JSON.stringify(request)+ '\n');
        }
      },
    });

    /**
     * Emite un evento de tipo __response__.
     * Esto es para que pueda resolver el problema de la recepción de mensajes a trozos, cuando
     * ocurre un evento de tipo __data__.
     */
    let wholeData = '';
    client.on('data', (dataChunk) => {
      wholeData += dataChunk;
      let messageLimit = wholeData.indexOf('\n');
      while (messageLimit !== -1) {
        const message = wholeData.substring(0, messageLimit);
        wholeData = wholeData.substring(messageLimit + 1);
        client.emit('response', JSON.parse(message));
        messageLimit = wholeData.indexOf('\n');
      }
    });
    /**
     * Responde al tipo de evento 'response' 
     */
    client.on('response', (res)=> {
      switch (res.type) {
        case 'add':
          if (res.success === true) {
            console.log(chalk.green(`Nota agregada`));
          } else {
            console.log(chalk.red(`No se puede agregar la nota. \n${res.info}`));
          }
          break;
        case 'remove':
          if (res.success === true) {
            console.log(chalk.green(`Nota eliminada!`));
          } else {
            console.log(chalk.red(`Error, la nota no se puede eliminar porque no existe`));
          }
          break;
        case 'read':
          if (res.success === true) {
            console.log('Contenido de la nota:');
            console.log(chalk.green(res.notes.bodyText));
          } else {
            console.log(chalk.red(res.info));
          }
          break;
        case 'list':
          if (res.success === true) {
            let notes: [] = res.notes.list;
            console.log(`Las notas del usuario ${res.notes.name} son:`);
            notes.forEach((note: string) => {
              let values = Object.values(note).at(0);
              console.log(chalk.green(values));
            });
          } else {
            console.log(chalk.red(`Error, no tienes notas`));
          }
          break;

        default:
          break;
      }
    });
    yargs.parse();
  }
}
const client = new Client();
client.start();