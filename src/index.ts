import _ from 'lodash';
import Phaser from 'phaser';
import MainScene from './MainScene';

class TestGame extends Phaser.Game {
    constructor() {
        super({
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                },
            },
            scene: [
                MainScene,
            ],
        });
    }

    preload() {
        this.boot;
    }
}

window.onload = () => {
    const game = new TestGame();
}