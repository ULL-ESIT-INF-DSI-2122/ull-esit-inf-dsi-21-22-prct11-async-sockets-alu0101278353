import { Note } from './Notes';
export declare class CollectionNotes {
    protected ListNotes: Set<Note>;
    addNote(note: Note): void;
    removeNote(note: Note): void;
    getListNotes(): Set<Note>;
}
