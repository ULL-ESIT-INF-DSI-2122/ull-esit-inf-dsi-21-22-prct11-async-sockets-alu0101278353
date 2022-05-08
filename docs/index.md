# __Prática-11 - Cliente y servidor para una aplicación de procesamiento de notas de texto__

## Desarrollo de la práctica

Para desarrollar esta práctica tal y como se nos ha solicitado de que el servidor tiene que ser responsable de hacer persistente la lista de notas de cada usuario, es decir que este gestione la creación, eliminación, listado y leer una nota cada vez que el cliente solicite algunas de estas acciones. Para ello en el fichero `server.ts` tenemos el sigueinte código, el cual se irá explicando por partes, en primer lugar tenemos:

```ts
// Ruta del directorio de notas
const pathFile = '/home/usuario/p11/src/Notes/';
/**
 * Array que contiene a los usuarios con sus notas.
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
```

Luego, haciendo uso del módulo **net** de node, creamos el servidor para que pueda escuchar las peticiones del cliente por el puerto `60300`:

```ts
net.createServer((connection) => {
  /**
   * Emite un evento de tipo __request__.
   * Esto es para que pueda resolver el problema de la recepción de mensajes a trozos cuando
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
```

Ahora vamos a ver el procedimiento  cuando ocurre un evento de tipo **request** en el server, pero antes se mostrará el tipo de respuesta al cliente y el tipo de solicitud al servidor:

El tipo de respuesta que iemitirá el server al cliente se encuentra en el fichero `respose.ts`:

```ts
/**
 * Tipo de respuesta para el cliente
 * `type` tipo de respuesta que gestionará el cliente
 * `success` si se ha realizado correctamente la petición
 * `info` información detallada para el cliente
 * `notes` de tipo User o de tipo Note 
 */
export type ResponseType = {
  type: 'read' | 'list'|'add' | 'remove';
  success: boolean;
  info?: string;
  notes?: User | Note;
}
```

Y, el tipo de solicitud del cliente al server se encuentra en el fichero `request.ts`:

```ts
/**
 * Tipo de petición para el server
 * `type` tipo de solicitud que gestionará el servidor
 * `title` titulo de la nota
 * `body` contenido de la nota
 * `color` color de la nota
 */
export type RequestType = {
  type: 'add' | 'remove' | 'read' | 'list';
  user?: string;
  title?: string;
  body?: string;
  color?: string;
}
```

Ahora sí vamos a explicar la acción del server frente a un evento de tipo `request`:

```ts
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
```

Como se puede ver, cuando la acción del cliente es de `agregar una nota` primero tenemos dos tipos de respuesta, `responseAddTrue` cuando la nota se ha agregado correctamente emite ese tipo de respuesta, y `responseAddFalse` cuando la nota no puede ser agregada. Y todo esto haciendo uso del método `write` del socket.

Luego tenemos la siguente acción del cliente, que es `list`:

```ts
case 'list':
        // Llamamos a la función para tener la lista de usuarios
        setUsers();
        // Comprobamos que el usuario exista, si no existe emite una respuesta 'success=false'
        if (users.find((user) => user.getName() === message.user)) {
          let user: User | undefined = users.find((user) => user.getName() === message.user);
          if (user !== undefined) {
            const responseListNotes: ResponseType = {
              type: 'list',
              success: true,
              notes: user,
            };
            connection.write(JSON.stringify(responseListNotes)+ '\n');
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
        }
        break;
```

Como se puede ver, tambien tenemos tipos de respuesta para el cliente, `responseListNotes` y `responseListNotesFalse` que hace practicamente lo mismo que se mencionó anteriormente, pero ahora tiene una nueva property `notes: user`, donde **user** es de tipo `User`, es decir que ese usuario tiene una lista de notas.

Luego tenemos el tipo de solicitud del cliente `read`, que leerá el contenido de la nota que ha solicitado el cliente:

```ts
case 'read':
          setUsers();
          // Comprobamos que el usuario exista
          if (users.find((user) => user.getName() === message.user)) {
            let user: User | undefined = users.find((user) => user.getName() === message.user);
            if (user !== undefined) {
              // Comprobamos que la nota exista
              if (fs.existsSync(`${directoryUser}${noteNew}.json`)) {
                const note = fs.readFileSync(`${directoryUser}${noteNew}.json`, {encoding: 'utf8', flag: 'r'});
                const objectNote: note.Note = JSON.parse(note);
                // Tipo de respuesta si la nota existe
                const responseListNotes: ResponseType = {
                  type: 'read',
                  success: true,
                  notes: objectNote,
                };
                connection.write(JSON.stringify(responseListNotes)+ '\n');
                connection.end();
              } else {
                  // Si no existe la nota
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
              // Respuesta si no existe el usuario
            const responseNoExistUser: ResponseType = {
              type: 'read',
              success: false,
              info: 'Error, el usuario no existe',
            };
            connection.write(JSON.stringify(responseNoExistUser)+ '\n');
            connection.end();
          }
          break;
```
Ahora tenemos la acción `remove`:

```ts
case 'remove': 
        // tipo de respuesta si se ha eliminado
        const responseRemoveTrue: ResponseType = {
          type: 'remove',
          success: true,
        };
        // Tipo de respuesta si no se ha eliminado la nota
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
```

Ahora vamos a ver como el el cliente realiza la petición al server y como reacciona frente a un evento de tipo `response`. Para ello se ha creado el fichero `cliente-note-app.ts`, donde hacemos uso del paquete `chalk` y `yargs`. Tal y como se nos ha solicitado de que le usuario solo pueda interactuar con la aplicación a través de la línea de comandos del cliente.

```ts
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
```

Cuando ocurre un evento de tipo `data`, lo que hace es lo siguiente:

```ts
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
```

Ahora, cuando ocurre el evento de tipo `response`, acciona de la siguiente manera:

```ts
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
```

Como se puede ver, si la respuesta del `server` es de tipo `add` el cliente imprimirá por pantalla si se ha agregado correctamente o no la nota, vamos a ver un ejemplo:

Ejecutamos el server:

```console
[~/p11(master)]$node dist/API/server.js
Esperando conexiones
```

Ejecutamos el cliente:

```console
[~/p11(master)]$node dist/API/cliente-note-app.js add --user="Carlos" --title="Disponibilidad" --body="No estoy dispible" --color="red"
Nota agregada
```

En el lado servidor cuando ejecutamos el cliente nos muestra por consola lo siguiente:

```console
[~/p11(master)]$node dist/API/server.js
Esperando conexiones
Un cliente se ha conectado
```

Continuando con la explicación del código, ahora veremos la acción del cliente frente la respuesta de tipo `read`:

```ts
case 'read':
      if (res.success === true) {
        console.log('Contenido de la nota:');
        console.log(chalk.green(res.notes.bodyText));
      } else {
        console.log(chalk.red(res.info));
      }
      break;
```

Volvemos a ejecutar el cliente con el comando `read` para leer la nota que acabamos de crear:

```console
[~/p11(master)]$node dist/API/cliente-note-app.js read --user="Carlos" --title="Disponibilidad"
Contenido de la nota:
No estoy dispible
```

En caso de que el usuario o la nota no exista, también imprime por pantalla esa información.

```console
[~/p11(master)]$node dist/API/cliente-note-app.js read --user="Carlos" --title="Dis"
Error, la nota no existe

[~/p11(master)]$node dist/API/cliente-note-app.js read --user="Carlo" --title="Disponibilidad"
Error, el usuario no existe
```

Continuando con la explicación del código, ahora veremos la acción del cliente frente a la respuesta de tipo `list` de parte del servidor:

```ts
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
```
Esto listará las notas que tiene el usuario. Veremos un ejemplo de ello:

```console
[~/p11(master)]$node dist/API/cliente-note-app.js list --user="Carlos"
Las notas del usuario Carlos son:
Disponibilidad
```
En caso de que el usuario no tenga notas, también imprimirá por pantalla de que no tiene notas:

```console
[~/p11(master)]$node dist/API/cliente-note-app.js list --user="vacio"
Error, no tienes notas
```

Ahora vamos con la acción `remove`:

```ts
case 'remove':
      if (res.success === true) {
        console.log(chalk.green(`Nota eliminada!`));
      } else {
        console.log(chalk.red(`Error, la nota no se puede eliminar porque no existe`));
      }
      break;
```

El resultado es el siguiente, en caso de que la nota existiera o no existiera:

```console
[~/p11(master)]$node dist/API/cliente-note-app.js remove --user="Carlos" --title="Disponibilidad"
Nota eliminada!

[~/p11(master)]$node dist/API/cliente-note-app.js remove --user="Carlos" --title="Disponibilidad"
Error, la nota no se puede eliminar porque no existe
```

Como eliminamos la nota, nos dice que no se puede eliminar porque no está.
