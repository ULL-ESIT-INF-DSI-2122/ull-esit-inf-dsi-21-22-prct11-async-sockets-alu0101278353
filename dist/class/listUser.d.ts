import { User } from './User';
export declare class ListUsers {
    private listUsers;
    constructor();
    addUser(user: User): void;
    userExist(usu: string): boolean;
    removeNoteUser(usu: string, title: string): void;
}
