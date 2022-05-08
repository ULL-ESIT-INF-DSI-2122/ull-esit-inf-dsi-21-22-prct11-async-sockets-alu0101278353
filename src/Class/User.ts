import { Note } from './Note';
// import { ResponseType } from '../ResponseType/response';
/**
 * Clase que representa a un Usuario
 */
export class User {
  /**
   * atributo privado que contiene una lista de notas del usuario
   */
  private list: Note[];
  /**
   * Constructor de la clase
   * @param name Nombre del usuario
   */
  constructor(private name: string) {
    this.list = [];
  }
  /**
   * 
   * @param newName 
   */
  public setName(newName: string): void {
    this.name = newName;
  }
  /**
   * Getter para 'name'
   * @returns nombre del usuario
   */
  public getName(): string {
    return this.name;
  }
  /**
   * Agrega una nota
   * @param note nota a agregar
   */
  public setNote(note: Note): void {
    this.list = [...this.list, note];
  }
  /**
   * Elimina una nota
   * @param titleNota titulo de la nota a eliminar 
   */
  public removeNote(titleNota: string): void {
    this.list = this.list.filter((n) => n.getTitle() !== titleNota);
  }

  /**
   * Getter para 'list' de notas
   * @returns devuelve la lista de notas
   */
  public getNotes(): Note[] {
    return this.list;
  }
  /**
   * Busca la nota del usuario
   * @param title 
   * @returns 
   */
  public searchNote(title: string): boolean {
    let value: boolean = true;
    if (this.list.find((n) => n.getTitle() === title)) {
      value;
    } else {
      value = false;
    }
    return value;
  }
  /**
   * 
   * @returns 
   */
//   const readNote = (title: string,
//     cb: (err: string | undefined, res: ResponseType | undefined) => void) => {
//     loadNotes((err, data) => {
//     if (err) {
//       cb(err, undefined);
//     } else if (data) {
//       const notes: Note[] = JSON.parse(data);
//       const foundNote = notes.find((note) => note.title === title);
//       const response: ResponseType = {
//         type: 'read',
//         success: foundNote?true:false,
//         notes: foundNote?[foundNote]:undefined,
//       };
//       cb(undefined, response);
//     }
//   });
// };
  /**
   * Devuelve los titulos de la notas que tiene el usuario
   * @returns un string con los titulos
   */
  public getTitleNotes(): string {
    let out: string = '';
    this.list.forEach((note) => {
      out = `Notas del usuario:\n  ${note.getTitle()}\n`;
    });
    return out;
  }
  
  /**
   * Devuelve 'true' si encuentra la nota del usuario
   * @param nameNote nombre de la nota
   * @returns valor booleano
   */
  // public existNoteUser(nameNote: string): boolean {
  //   let value: boolean = true;
  //   this.getListNotes().forEach((note) => {
  //     if (note.getTitle() === nameNote) {
  //       return value;
  //     } else {
  //       return value = false;
  //     }
  //   });
  //   return value;
  // }
}
// let users: User[] = [];
// let user = new User('elvis');
// let user2 = new User('fer');
// let nota1 = new Note('puchi', 'asdhflña0', 'lsls');
// let nota2= new Note('cora', 'asdhflña0', 'lsls');
// user.setNote(nota1);
// user.setNote(nota2);
// user2.setNote(nota1);
// user.removeNote('puchi');
// users.push(user);
// users.push(user2);
// console.log( user instanceof User);