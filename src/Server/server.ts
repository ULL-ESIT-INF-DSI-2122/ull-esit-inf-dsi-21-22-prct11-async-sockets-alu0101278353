import * as net from 'net';
import * as fs from 'fs';
import * as note from '../Class/Note';
import { User } from '../Class/User';
import { ResponseType } from '../Types/response';

/**
 * Clase que representa a un servidor
 */
export class Server {
  constructor() {}
  /**
   * Inicia el Servidor
   */
  public start() {
    /**
     * Ruta del directorio de notas
     */
    const pathFile = '/home/usuario/p11/src/Notes/';
    /**
     *Array que contiene a los usuarios con sus notas.
    */
    let users: User[] = [];
    /**
      * __Función que recupera las notas de los usuarios__
      * 
      * Haciendo el uso del sistema de fichero de node, recuperamos los usuarios y sus notas
      * para poder meterlos en el array 'users'. Esto es para cuando un usuario quiera listar las notas
      * o poder ver el contenido que tiene una nota en especifico.
      */
    const setUsers = () => {
      const file = fs.readdirSync(pathFile);
      file.map((user) => {
        const newUser = new User(user);
        const notes = fs.readdirSync(pathFile+user);
        notes.map((note) => {
          const newNote = fs.readFileSync(pathFile+user+'/'+note, {encoding: 'utf8', flag: 'r'});
          newUser.setNote(JSON.parse(newNote));
        });
        users = [...users, newUser];
      });
    };

    net.createServer((connection) => {
      /**
       * Emite un evento de tipo __request__.
       * Esto es para que pueda resolver el problema de la recepción de mensajes a trozos, cuando
       * ocurre un evento de tipo __data__.
       */
      let wholeData = '';
      connection.on('data', (dataChunk) => {
        wholeData += dataChunk;
        let messageLimit = wholeData.indexOf('\n');
        while (messageLimit !== -1) {
          const message = wholeData.substring(0, messageLimit);
          wholeData = wholeData.substring(messageLimit + 1);
          connection.emit('request', JSON.parse(message));
          messageLimit = wholeData.indexOf('\n');
        }
      });

      /**
       * Imprime por consola que el cliente se ha conectado
       */
      console.log('Un cliente se ha conectado');
      
      /**
       * Imprime por consola que el cliente se ha desconectado
       */
      connection.on('close', () => {
        console.log('Un cliente se ha desconectado');
      });

      /**
       * Cuando ocurre un evento de tipo __request__
       */
      connection.on('request', (message) => {
        let user = message.user;
        let directoryUser = `${pathFile}${user}/`;
        let noteNew = message.title;
        // Creamos instancia de usuario y su nota
        const newNote = new note.Note(message.title, message.body, message.color);
        const newUser = new User(user);
        // Miramos el tipo de acción del cliente
        switch (message.type) {
          case 'add': 
            const responseAddTrue: ResponseType = {
              type: 'add',
              success: true,
            };
            const responseAddFasle: ResponseType = {
              type: 'add',
              success: false,
              info: 'Tienes una nota con ese nombre',
            };
            // Comprobamos que el directorio del usuario exista, y si no existe lo creamos.
            if (!fs.existsSync(directoryUser)) {
              fs.mkdirSync(directoryUser);
              fs.writeFileSync(`${directoryUser}${noteNew.title}.json`, JSON.stringify(newNote, null, 2));
              newUser.setNote(newNote);
              connection.write(JSON.stringify(responseAddTrue)+ '\n');
            } else {
              if (!fs.existsSync(`${directoryUser}${noteNew}.json`)) {
                fs.writeFileSync(`${directoryUser}${noteNew}.json`, JSON.stringify(newNote, null, 2));
                newUser.setNote(newNote);
                connection.write(JSON.stringify(responseAddTrue)+ '\n');
              } else {
              connection.write(JSON.stringify(responseAddFasle)+ '\n');
              }
            }
            break;
          case 'list':
            setUsers();
            // Comprobamos que el usuario exista
            let usern: User | undefined = users.find((user) => user.getName() === message.user);
            let notess: note.Note[] | undefined = usern?.getNotes();
            if (users.find((user) => user.getName() === message.user) && notess !== undefined && notess.length > 0) {
              let user: User | undefined = users.find((user) => user.getName() === message.user);
              if (user !== undefined) {
                const responseListNotes: ResponseType = {
                  type: 'list',
                  success: true,
                  notes: user,
                };
                connection.write(JSON.stringify(responseListNotes)+ '\n');
                connection.end();
              }
              else {
                const responseListNotes: ResponseType = {
                  type: 'list',
                  success: true,
                  notes: user,
                };
                console.log(user);
                connection.write(JSON.stringify(responseListNotes)+ '\n');
              }
            } else {
              const responseListNotesFalse: ResponseType = {
                type: 'list',
                success: false,
              };
              connection.write(JSON.stringify(responseListNotesFalse)+ '\n');
              connection.end();
            }
            break;
          case 'read':
              setUsers();
              // Comprobamos que el usuario exista
              let user: User | undefined = users.find((user) => user.getName() === message.user);
              let notes: note.Note[] | undefined = user?.getNotes();
              if (users.find((user) => user.getName() === message.user) && notes !== undefined && notes.length > 0) {
                if (user !== undefined) {
                  // Comprobamos que la nota exista
                  if (fs.existsSync(`${directoryUser}${noteNew}.json`)) {
                    const note = fs.readFileSync(`${directoryUser}${noteNew}.json`, {encoding: 'utf8', flag: 'r'});
                    const objectNote: note.Note = JSON.parse(note);
                    const responseListNotes: ResponseType = {
                      type: 'read',
                      success: true,
                      notes: objectNote,
                    };
                    connection.write(JSON.stringify(responseListNotes)+ '\n');
                    connection.end();
                  } else {
                    const responseNoteFalse: ResponseType = {
                      type: 'read',
                      success: false,
                      info: 'Error, la nota no existe',
                    };
                    connection.write(JSON.stringify(responseNoteFalse)+ '\n');
                    connection.end();
                  }
                }
              } else {
                const responseNoExistUser: ResponseType = {
                  type: 'read',
                  success: false,
                  info: 'Error, el usuario no existe',
                };
                connection.write(JSON.stringify(responseNoExistUser)+ '\n');
                connection.end();
              }
              break;
          case 'remove': 
            const responseRemoveTrue: ResponseType = {
              type: 'remove',
              success: true,
            };
            const responseRemoveFasle: ResponseType = {
              type: 'remove',
              success: false,
            };
            // Comprobamos que la nota del usuario exista
            if (fs.existsSync(`${directoryUser}${noteNew}.json`)) {
              newUser.removeNote(newNote.getTitle());
              fs.unlinkSync(`${directoryUser}${noteNew}.json`);
              connection.write(JSON.stringify(responseRemoveTrue)+ '\n');
              connection.end();
            } else {
              connection.write(JSON.stringify(responseRemoveFasle)+ '\n');
              connection.end();
            }
            break;          
          default:
            break;
        }
      });
    }).listen(60300, () => {
      console.log('Esperando conexiones');
    });
  }
}

const server = new Server();
server.start();