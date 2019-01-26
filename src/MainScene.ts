import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    player: Phaser.Physics.Arcade.Sprite;

    constructor() {
        super({
            key: 'Main Scene',
        });
    }

    preload() {
        this.load.setBaseURL('assets/');
        this.load.image('player', 'player.png');
        this.load.image('particle', 'particle.png');
        this.load.image('background', 'background.png');
        this.cameras.main.setBackgroundColor('#ffe800');
    }

    create() {
        const group = this.physics.add.staticGroup();
        this.player = this.physics.add.sprite(400, 300, 'player');
        // const computer = this.add.image(400, 300, 'computer');
        const particles = this.add.particles('particle');
        const emitter = particles.createEmitter({
            speed: 50,
            scale: { start: 0.5, end: 0 },
            blendMode: Phaser.BlendModes.ADD,
        });
        emitter.startFollow(this.player);
    }

    update() {
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.player.setVelocityX(-200);
        }
        if (cursors.right.isDown) {
            this.player.setVelocityX(200);
        }
        if (cursors.up.isDown) {
            this.player.setVelocityY(-200);
        }
        if (cursors.down.isDown) {
            this.player.setVelocityY(200);
        }
        if (this.noCursorIsDown(cursors)) {
            this.player.setVelocity(0);
        }
    }

    noCursorIsDown(cursors: Phaser.Input.Keyboard.CursorKeys) {
        return cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp;
    }
}