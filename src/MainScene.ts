import Phaser from 'phaser';

const SPEED = 200;

export default class MainScene extends Phaser.Scene {
    player: Phaser.Physics.Arcade.Sprite;
    playerHealth = 5;
    isPlayerFlipped = false;
    cursors: Phaser.Input.Keyboard.CursorKeys;
    rectWidth = 100;
    computerIcon: Phaser.Physics.Arcade.Sprite;
    monsters: Phaser.Physics.Arcade.Sprite[] = [];
    obstacleLayer: Phaser.Tilemaps.StaticTilemapLayer;
    gunCooldown = 0;
    hunger = 100000;
    hungerBar: Phaser.GameObjects.Graphics;
    floorLayer: Phaser.Tilemaps.StaticTilemapLayer;
    skyAndDuneLayer: Phaser.Tilemaps.StaticTilemapLayer;

    constructor() {
        super({
            key: 'Main Scene',
        });
    }

    preload() {
        this.load.setBaseURL('assets/');
        this.load.image('desert-tiles', 'desert-tileset.png');
        this.load.image('walls-tiles', 'walls-tileset.png');
        this.load.tilemapCSV('floor-tilemap', 'floor-tilemap.csv');
        this.load.tilemapCSV('sky-and-dune-tilemap', 'sky-and-dune-tilemap.csv');
        this.load.tilemapCSV('obstacle-tilemap', 'obstacle-tilemap.csv');
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

        // Floor layer
        const floorTilemap = this.make.tilemap({ key: 'floor-tilemap', tileWidth: 32, tileHeight: 32 });
        const floorTileset = floorTilemap.addTilesetImage(null, 'desert-tiles'); // TODO: EXTRUDE
        this.floorLayer = floorTilemap.createStaticLayer(0, floorTileset, 0, 0);

        // Sky and dune layer
        const skyAndDuneTilemap = this.make.tilemap({ key: 'sky-and-dune-tilemap', tileWidth: 32, tileHeight: 32 });
        const skyAndDuneTileset = floorTilemap.addTilesetImage(null, 'desert-tiles'); // TODO: EXTRUDE
        this.skyAndDuneLayer = skyAndDuneTilemap.createStaticLayer(0, skyAndDuneTileset, 0, 0);

        // Obstacle layer
        const obstacleTilemap = this.make.tilemap({ key: 'obstacle-tilemap', tileWidth: 32, tileHeight: 32 });
        const obstacleTileset = obstacleTilemap.addTilesetImage(null, 'walls-tiles'); // TODO: EXTRUDE
        this.obstacleLayer = obstacleTilemap.createStaticLayer(0, obstacleTileset, 0, 0);

        // const desertTileset = desertTilemap.addTilesetImage(null, 'tiles', 16, 16, 1, 2);
        // this.obstacleLayer = desertTilemap.createStaticLayer(0, desertTileset, 0, 0);
        // const wallsLayer = wallsTilemap.createStaticLayer(0, wallsTileset, 0, 0);
        // backgroundLayer.setDepth(-1);
        // this.obstacleLayer.setCollisionByExclusion([-1], true);
        // this.obstacleLayer.setDepth(1);
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
        this.physics.add.collider(this.player, this.monsters[0], () => {
            this.player.setTint(0xee0000);
            this.playerHealth--;
            if (this.playerHealth === 0) {
                this.player.destroy();
            }
            const playerX = this.player.body.x;
            const playerY = this.player.body.y;
            this.player.setRandomPosition(playerX-100, playerY-100, 200, 200);
            setTimeout(() => {
                this.player.setTint(0xffffff);
            }, 500);
            return true;
        });
        this.physics.add.collider(this.monsters[0], this.obstacleLayer);
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
        this.physics.add.collider(this.player, this.obstacleLayer);
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

        this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' }).setDepth(199);
    }

    update(time, delta) {
        // monsters
        if (this.playerHealth === 0) {
            return;
        }
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
        // this.rect.clear();
        // this.rect.setDepth(30);
        // this.rect.lineStyle(2, 0xff00ff, 1);
        // this.rectWidth += delta / 10;
        // this.rect.strokeRect(100, 300, this.rectWidth, 60);

        // player movement
        if (this.playerHealth > 0) {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-SPEED);
                this.player.anims.play('walk', true);
                this.player.setFlipX(true);
                this.isPlayerFlipped = true;
            }
            if (this.cursors.right.isDown) {
                this.player.setVelocityX(SPEED);
                this.player.anims.play('walk', true);
                this.player.setFlipX(false);
                this.isPlayerFlipped = false;
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
            if (this.cursors.space.isDown && this.gunCooldown <= 0) {
                this.gunCooldown = 500;
                const playerX = this.player.body.x;
                const playerY = this.player.body.y;
                const bullet = this.physics.add.sprite(playerX, playerY+20, 'particle').setDepth(20);
                bullet.setScale(0.1);
                bullet.setVelocityX(this.isPlayerFlipped ? -400 : 400);
                this.physics.add.collider(bullet, this.obstacleLayer, () => {
                    bullet.setPosition(-1000, -1100);
                    bullet.setVelocity(0, 0);
                })
                this.physics.add.collider(bullet, this.monsters[0], () => {
                    this.monsters[0].setPosition(1000, 1000);
                    bullet.setPosition(-1000, -1100);
                    bullet.setVelocity(0, 0);
                });
            }
            if (this.gunCooldown > 0) {
                this.gunCooldown -= delta;
                console.log(this.gunCooldown);
            }
            this.player.body.velocity.normalize().scale(SPEED)
        }
    }

    noCursorIsDown(cursors: Phaser.Input.Keyboard.CursorKeys) {
        return cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp;
    }
}