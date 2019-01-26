import Phaser from 'phaser';
import MainScene from './MainScene';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'Menu Scene',
        });
    }

    preload() {
        this.add.text(200, 250, 'welcome to game. have fun.', { fontSize: '32px', fill: '#ee00ee' }).setDepth(199);
        this.add.text(230, 300, '(press space to start)', { fontSize: '18px', fill: '#ee00ee' }).setDepth(199);
    }

    create() {
    }

    update(time, delta) {
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.space.isDown) {
           this.scene.start('Main Scene'); 
        }
    }
}