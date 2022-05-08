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