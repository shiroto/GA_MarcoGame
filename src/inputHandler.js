export class InputHandler {
    constructor(window, clickCallback) {
        window.addEventListener('click', (event) => this._handleClick(event));
        this.clickCallback = clickCallback;
    }

    _handleClick(event) {
        this.clickCallback({ x: event.x, y: event.y })
    }
}