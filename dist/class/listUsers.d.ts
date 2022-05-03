import { User } from './User';
export declare class ListUsers {
    private listUsers;
    constructor();
    addUser(user: User): void;
    /**
     * Comprueba que exista el usuario
     * @param usu usuario a buscar
     * @returns un valor boleano
     */
    userExist(usu: string): boolean;
}
