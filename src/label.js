export class Label {
    constructor(ticker, parent, position, getText) {
        this.ticker = ticker;
        this.updateEvent = this._update.bind(this);
        this.ticker.add(this.updateEvent);
        this.message = new PIXI.Text('Hello, PixiJS!', { fontFamily: 'Arial', fontSize: 30, fill: 0xFFFFFF, align: 'center' });
        console.log(this.message);
        this.message.x = position.x;
        this.message.y = position.y;
        parent.addChild(this.message);
        this.getText = getText;
    }

    _update(delta) {
        this.message.text = this.getText();
    }
}