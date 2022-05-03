"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionNotes = void 0;
class CollectionNotes {
    constructor() {
        this.ListNotes = new Set();
        //  public searchNameNote(): 
        //   public existNote(searchNote: Note): boolean {
        //     if (this.ListNotes.has(searchNote)) {
        //       return true;
        //     } else return false;
        //   }
    }
    addNote(note) {
        this.ListNotes.add(note);
    }
    removeNote(note) {
        this.ListNotes.delete(note);
    }
    getListNotes() {
        return this.ListNotes;
    }
}
exports.CollectionNotes = CollectionNotes;
//# sourceMappingURL=CollectionNotes.js.map