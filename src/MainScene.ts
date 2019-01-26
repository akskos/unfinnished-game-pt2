import Phaser from 'phaser';

const SPEED = 200;

export default class MainScene extends Phaser.Scene {
    player: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Input.Keyboard.CursorKeys;
    rect: Phaser.GameObjects.Graphics;
    rectWidth = 100;
    computerIcon: Phaser.Physics.Arcade.Sprite;
    monsters: Phaser.Physics.Arcade.Sprite[] = [];

    constructor() {
        super({
            key: 'Main Scene',
        });
    }

    preload() {
        this.load.setBaseURL('assets/');
        this.load.image('tiles', 'forest_tiles_extruded.png');
        this.load.tilemapCSV('map', 'forest_tilemap.csv');
        this.load.tilemapCSV('backgroundMap', 'forest_tilemap_background.csv');
        this.load.spritesheet('player',
            'dude.png',
            { frameWidth: 18, frameHeight: 25 },
        );
        this.load.spritesheet('monster',
            'monster.png',
            { frameWidth: 50, frameHeight: 50 }
        );
        this.load.image('computer', 'computer.png');
        this.load.image('particle', 'particle.png');
        this.load.image('background', 'background.png');
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        const map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
        const backgroundMap = this.make.tilemap({ key: 'backgroundMap', tileWidth: 16, tileHeight: 16 });
        const tileset = map.addTilesetImage(null, 'tiles', 16, 16, 1, 2);
        const layer = map.createStaticLayer(0, tileset, 0, 0);
        const backgroundLayer = backgroundMap.createStaticLayer(0, tileset, 0, 0);
        backgroundLayer.setDepth(-1);
        layer.setCollisionByExclusion([-1], true);
        layer.setDepth(1);
        // const group = this.physics.add.staticGroup();
        this.player = this.physics.add.sprite(200, 300, 'player').setScale(2);
        this.player.setDepth(1);
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 15,
            repeat: -1,
        });
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 15,
            repeat: -1,
        });
        this.player.anims.play('idle', true);
        this.monsters.push(this.physics.add.sprite(0, 300, 'monster').setDepth(1));
        this.anims.create({
            key: 'monster_idle',
            frames: this.anims.generateFrameNumbers('monster', { start: 0, end: 4 }),
            frameRate: 15,
            repeat: -1,
        });
        this.monsters[0].anims.play('monster_idle', true);
        this.physics.add.collider(this.player, this.monsters[0]);
        this.physics.add.collider(this.monsters[0], layer);
        // this.physics.add.collider(this.player, this.monsters[0], () => {
        //     this.player.setTint(0xee0000);
        //     setTimeout(() => {
        //         this.player.setTint(0xffffff);
        //     }, 500);
        //     let positionOffsetX = Math.floor(Math.random() * 20) + 80;
        //     let positionOffsetY = Math.floor(Math.random() * 20) + 80;
        //     Math.floor(Math.random() * 2) === 0 ? positionOffsetX *= -1 : null;
        //     Math.floor(Math.random() * 2) === 0 ? positionOffsetY *= -1 : null;
        //     this.player.setPosition(this.player.body.x + positionOffsetX, this.player.body.y + positionOffsetY);
        // });
        // const computer = this.physics.add.sprite(200, 300, 'computer').setScale(1);
        const smallComputer = this.physics.add.sprite(-100, -100, 'computer').setScale(0.05);
        this.physics.add.collider(this.player, smallComputer, (obj1, obj2) => {
            smallComputer.destroy();
            const worldPoint = this.cameras.main.getWorldPoint(40, 40);
            this.computerIcon = this.physics.add.sprite(0, 0, 'computer').setScale(0.03).setPosition(worldPoint.x, worldPoint.y);
            this.computerIcon.setDepth(100);
        });
        this.physics.add.collider(this.player, layer);
        // const computer = this.add.image(400, 300, 'computer');
        const particles = this.add.particles('particle').setDepth(30);
        const emitter = particles.createEmitter({
            speed: 50,
            scale: { start: 0.2, end: 0 },
            blendMode: Phaser.BlendModes.ADD,
        });
        // emitter.startFollow(this.player);
        const camera = this.cameras.main;
        camera.startFollow(this.player);

        this.rect = this.add.graphics();
        this.physics.add.collider(this.player, this.rect);
            
        this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' }).setDepth(199);
    }

    update(time, delta) {
        // monsters
        const xVelocity = this.player.body.x - this.monsters[0].body.x;
        const yVelocity = this.player.body.y - this.monsters[0].body.y;
        const distance = Math.sqrt(Math.pow(xVelocity, 2) + Math.pow(yVelocity, 2));
        if (distance < 250) {
            this.monsters[0].setVelocityX(xVelocity);
            this.monsters[0].setVelocityY(yVelocity);
            this.monsters[0].body.velocity.normalize().scale(100);
            if (xVelocity < 0) {
                this.monsters[0].setFlipX(true);
            } else {
                this.monsters[0].setFlipX(false);
            }
        } else {
            this.monsters[0].setVelocity(0);
        }

        // icons
        const worldPoint = this.cameras.main.getWorldPoint(40, 40);
        this.computerIcon && this.computerIcon.setPosition(worldPoint.x, worldPoint.y);

        // rect
        this.rect.clear();
        this.rect.setDepth(30);
        this.rect.lineStyle(2, 0xff00ff, 1);
        this.rectWidth += delta / 10;
        this.rect.strokeRect(100, 300, this.rectWidth, 60);

        // player movement
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-SPEED);
            this.player.anims.play('walk', true);
            this.player.setFlipX(true);
        }
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(SPEED);
            this.player.anims.play('walk', true);
            this.player.setFlipX(false);
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-SPEED);
            this.player.anims.play('walk', true);
        }
        if (this.cursors.down.isDown) {
            this.player.setVelocityY(SPEED);
            this.player.anims.play('walk', true);
        }
        if (this.noCursorIsDown(this.cursors)) {
            this.player.setVelocity(0);
            this.player.anims.play('idle', true);
        }
        this.player.body.velocity.normalize().scale(SPEED)
    }

    noCursorIsDown(cursors: Phaser.Input.Keyboard.CursorKeys) {
        return cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp;
    }
}