import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'Main Scene',
        });
    }

    preload() {
        this.load.setBaseURL('assets/');
        this.load.image('player', 'player.png');
        this.load.image('particle', 'particle.png');
    }

    create() {
        const group = this.physics.add.staticGroup();
        const player = group.create(400, 300, 'player').setScale(1).refreshBody();
        // const computer = this.add.image(400, 300, 'computer');
        const particles = this.add.particles('particle');
        const emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: Phaser.BlendModes.ADD,
        });
        emitter.startFollow(player);
    }
}