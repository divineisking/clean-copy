import { DataTransferMock } from './dataTransferMock.js';

export class ClipboardEventMock {
    constructor(type, { clipboardData = new DataTransferMock(), bubbles = true, cancelable = true } = {}) {
        this.type = type;
        this.clipboardData = clipboardData;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.defaultPrevented = false;
    }

    preventDefault() {
        this.defaultPrevented = true;
    }
}
