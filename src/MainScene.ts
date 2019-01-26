import Phaser from 'phaser';

const SPEED = 200;

export default class MainScene extends Phaser.Scene {
    player: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Input.Keyboard.CursorKeys;
    rect: Phaser.GameObjects.Graphics;
    rectWidth = 100;

    constructor() {
        super({
            key: 'Main Scene',
        });
    }

    preload() {
        this.load.setBaseURL('assets/');
        this.load.image('tiles', 'tileset.png');
        this.load.tilemapCSV('map', 'tilemap.csv');
        this.load.spritesheet('player',
            'minotaur.png',
            { frameWidth: 96, frameHeight: 100 },
        );
        this.load.image('computer', 'computer.png');
        this.load.image('particle', 'particle.png');
        this.load.image('background', 'background.png');
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        const map = this.make.tilemap({ key: 'map', tileWidth: 8, tileHeight: 8 });
        const tileset = map.addTilesetImage(null, 'tiles', 8, 8, 1, 2);
        const layer = map.createStaticLayer(0, tileset, 0, 0);
        layer.setScale(10);
        layer.setCollisionByExclusion([0], true);
        layer.setDepth(1);
        // const group = this.physics.add.staticGroup();
        this.player = this.physics.add.sprite(200, 300, 'player').setScale(0.7);
        this.player.setDepth(1);
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 4 }),
            frameRate: 15,
            repeat: -1,
        });
        this.player.anims.play('idle', true);
        const computer = this.physics.add.sprite(200, 300, 'computer').setScale(1);
        computer.setDepth(0);
        computer.setDrag(100);
        this.physics.add.collider(this.player, layer);
        // const computer = this.add.image(400, 300, 'computer');
        const particles = this.add.particles('particle').setDepth(30);
        const emitter = particles.createEmitter({
            speed: 50,
            scale: { start: 0.2, end: 0 },
            blendMode: Phaser.BlendModes.ADD,
        });
        emitter.startFollow(this.player);
        const camera = this.cameras.main;
        camera.startFollow(this.player);

        this.rect = this.add.graphics();
        this.physics.add.collider(this.player, this.rect);
    }

    update(time, delta) {
        console.log(delta);
        console.log(time);
        this.rect.clear();
        this.rect.setDepth(30);
        this.rect.lineStyle(2, 0xff00ff, 1);
        this.rectWidth += delta / 10;
        this.rect.strokeRect(100, 300, this.rectWidth, 60);
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
        if (this.cursors.space.isDown) {
            this.player.setTint(0xff0000);
        } else {
            this.player.setTint(0xffffff);
        }
        this.player.body.velocity.normalize().scale(SPEED)
    }

    noCursorIsDown(cursors: Phaser.Input.Keyboard.CursorKeys) {
        return cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp;
    }
}