import 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'Main Scene',
        });
    }

    preload() {
        this.load.image('computer', 'computer.jpg');
    }

    create() {
        this.add.image(400, 400, 'computer');
    }
}