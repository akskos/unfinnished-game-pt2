import Phaser from 'phaser';
import MainScene from './MainScene';

export default class IndicatorScene extends Phaser.Scene {
    hungerBar: Phaser.GameObjects.Graphics;
    hunger: number;
    mainScene: MainScene;

    constructor() {
        super({
            key: 'Indicator Scene',
        });
    }
    
    init(data) {
        this.mainScene = data;
    }

    preload() {
    }

    create() {
        this.hungerBar = this.add.graphics();
    }

    update(time, delta) {
        // update hunger
        if (this.mainScene.hunger > 0) {
            this.mainScene.hunger -= delta;
            this.hungerBar.clear();
            // this.rect.lineStyle(2, 0xff00ff, 1);
            this.hungerBar.fillStyle(0xee00ee);
            this.hungerBar.setDepth(20);
            this.hungerBar.fillRect(15, 15, this.mainScene.hunger / 100, 10);
        }
    }
}