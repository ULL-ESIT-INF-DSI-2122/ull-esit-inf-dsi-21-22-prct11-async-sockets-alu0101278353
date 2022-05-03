/**
 * Clase Note que representa una nota
 */
export declare class Note {
    private title;
    private bodyText;
    private color;
    constructor(title: string, bodyText: string, color: string);
    getTitle(): string;
    getBodyText(): string;
    getColor(): string;
    setTitle(newTitle: string): void;
    setBodyText(newBodyText: string): void;
    setColor(newColor: string): void;
    printNote(): string;
}
