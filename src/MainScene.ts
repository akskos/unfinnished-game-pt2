import Phaser from 'phaser';

const SPEED = 200;

export default class MainScene extends Phaser.Scene {
    player: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Input.Keyboard.CursorKeys;

    constructor() {
        super({
            key: 'Main Scene',
        });
    }

    preload() {
        this.load.setBaseURL('assets/');
        this.load.image('tiles', 'tileset.png');
        this.load.tilemapCSV('map', 'tilemap.csv');
        this.load.image('player', 'player.png');
        this.load.image('computer', 'computer.png');
        this.load.image('particle', 'particle.png');
        this.load.image('background', 'background.png');
        this.cameras.main.setBackgroundColor('#ffe800');
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        const map = this.make.tilemap({ key: 'map', tileWidth: 8, tileHeight: 8 });
        const tileset = map.addTilesetImage('tiles');
        const layer = map.createStaticLayer(0, tileset, 0, 0);
        layer.setScale(10);
        // layer.setScale(10);
        layer.setCollisionByExclusion([], true);
        // const group = this.physics.add.staticGroup();
        this.player = this.physics.add.sprite(400, 300, 'player');
        // const computer = group.create(600, 300, 'computer').setScale(0.1);
        // this.physics.add.collider(this.player, group);
        this.physics.add.collider(this.player, layer);
        // const computer = this.add.image(400, 300, 'computer');
        // const particles = this.add.particles('particle');
        // const emitter = particles.createEmitter({
        //     speed: 50,
        //     scale: { start: 0.5, end: 0 },
        //     blendMode: Phaser.BlendModes.ADD,
        // });
        // emitter.startFollow(this.player);
        const camera = this.cameras.main;
        camera.startFollow(this.player);
    }

    update() {
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-SPEED);
        }
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(SPEED);
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-SPEED);
        }
        if (this.cursors.down.isDown) {
            this.player.setVelocityY(SPEED);
        }
        if (this.noCursorIsDown(this.cursors)) {
            this.player.setVelocity(0);
        }
        this.player.body.velocity.normalize().scale(SPEED)
    }

    noCursorIsDown(cursors: Phaser.Input.Keyboard.CursorKeys) {
        return cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp;
    }
}