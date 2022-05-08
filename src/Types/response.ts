import { Note } from './Class/Note';
import { User } from './Class/User';

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