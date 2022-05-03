"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
// /**
//  * Enum Color para las notas
//  */
// export enum Color { red = 'red', yellow = 'yellow', blue = 'blue', orange = 'orange', green = 'green'};
// // export type Color = 'red'| 'yellow'| 'blue'| 'orange'| 'green';
/**
 * Clase Note que representa una nota
 */
class Note {
    constructor(title, bodyText, color) {
        this.title = title;
        this.bodyText = bodyText;
        this.color = color;
    }
    getTitle() {
        return this.title;
    }
    getBodyText() {
        return this.bodyText;
    }
    getColor() {
        return this.color;
    }
    setTitle(newTitle) {
        this.title = newTitle;
    }
    setBodyText(newBodyText) {
        this.bodyText = newBodyText;
    }
    setColor(newColor) {
        this.color = newColor;
    }
    printNote() {
        const out = `Titulo: ${this.title}, Contenido:${this.bodyText}, Color:${this.color}`;
        return out;
    }
}
exports.Note = Note;
//# sourceMappingURL=Notes.js.map