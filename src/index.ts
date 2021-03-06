import _ from 'lodash';
import Phaser from 'phaser';
import MainScene from './MainScene';
import MenuScene from './MenuScene';
import IndicatorScene from './IndicatorScene';

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
                MenuScene,
                MainScene,
                IndicatorScene,
            ],
        });
    }

    preload() {
        this.boot;
    }
}

window.onload = () => {
    // var el = document.getElementsByTagName('canvas')[0];
    // var requestFullScreen = el.requestFullscreen;
    // if(requestFullScreen) {
    //     requestFullScreen.call(el);
    // }
    const game = new TestGame();
}