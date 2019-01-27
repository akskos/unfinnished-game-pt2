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
    home: Phaser.GameObjects.Graphics;
    baby: Phaser.Physics.Arcade.Sprite;
    goal: Phaser.GameObjects.Graphics;
    rain: Phaser.GameObjects.Particles.ParticleEmitter;
    babyPickedUp: boolean;

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
            'player.png',
            { frameWidth: 64, frameHeight: 118 },
        );
        this.load.spritesheet('monster',
            'monster.png',
            { frameWidth: 50, frameHeight: 50 }
        );
        this.load.image('computer', 'computer.png');
        this.load.image('particle', 'particle.png');
        this.load.image('rain-particle', 'rainparticle.jpg');
        this.load.image('background', 'background.png');
        this.load.spritesheet('baby',
            'baby.png',
            { frameWidth: 38, frameHeight: 51 },
        );
        this.load.spritesheet('man-with-baby',
            'man-with-baby.png',
            { frameWidth: 49, frameHeight: 118 },
        );
    }

    create() {
        // document.getElementsByTagName('canvas')[0][this.game.device.fullscreen.request]();
        this.cursors = this.input.keyboard.createCursorKeys();

        // Floor layer
        const floorTilemap = this.make.tilemap({ key: 'floor-tilemap', tileWidth: 32, tileHeight: 32 });
        const floorTileset = floorTilemap.addTilesetImage(null, 'desert-tiles'); // TODO: EXTRUDE
        this.floorLayer = floorTilemap.createStaticLayer(0, floorTileset, 0, 0);
        this.floorLayer.setDepth(0);

        // Sky and dune layer
        const skyAndDuneTilemap = this.make.tilemap({ key: 'sky-and-dune-tilemap', tileWidth: 32, tileHeight: 32 });
        const skyAndDuneTileset = floorTilemap.addTilesetImage(null, 'desert-tiles'); // TODO: EXTRUDE
        this.skyAndDuneLayer = skyAndDuneTilemap.createStaticLayer(0, skyAndDuneTileset, 0, 0);
        this.skyAndDuneLayer.setCollisionByExclusion([-1], true);
        this.skyAndDuneLayer.setDepth(1);

        // Obstacle layer
        const obstacleTilemap = this.make.tilemap({ key: 'obstacle-tilemap', tileWidth: 32, tileHeight: 32 });
        const obstacleTileset = obstacleTilemap.addTilesetImage(null, 'walls-tiles'); // TODO: EXTRUDE
        this.obstacleLayer = obstacleTilemap.createStaticLayer(0, obstacleTileset, 0, 0);
        this.obstacleLayer.setCollisionByExclusion([-1], true);
        this.obstacleLayer.setDepth(1);

        // Home
        this.home = this.add.graphics(); 
        this.home.fillStyle(0x000000);
        this.home.setDepth(1);
        this.home.fillRect(200, 500, 100, 100);

        // Baby
        this.baby = this.physics.add.sprite(110, 510, 'baby').setScale(0.9);
        this.baby.setDepth(2);
        this.anims.create({
            key: 'baby-idle',
            frames: this.anims.generateFrameNumbers('baby', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1,
        });
        this.baby.anims.play('baby-idle', true);

        // Goal
        this.goal = this.add.graphics(); 
        this.goal.fillStyle(0x00ffff);
        this.goal.setDepth(1);
        this.goal.fillRect(700, 500, 100, 100);

        // Player
        this.player = this.physics.add.sprite(200, 500, 'player').setScale(0.5);
        this.player.setDepth(3);
        this.physics.add.collider(this.player, this.skyAndDuneLayer);
        this.physics.add.collider(this.player, this.obstacleLayer);
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 2, 1, 3] }),
            frameRate: 11,
            repeat: -1,
        });
        this.anims.create({
            key: 'man-with-baby-idle',
            frames: this.anims.generateFrameNumbers('man-with-baby', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: 'man-with-baby-walk',
            frames: this.anims.generateFrameNumbers('man-with-baby', { frames: [0, 2, 1, 3] }),
            frameRate: 11,
            repeat: -1,
        });
        this.playPlayerIdleAnimation();
        this.monsters.push(this.generateMonster());
        this.monsters.push(this.generateMonster());
        this.monsters.push(this.generateMonster());
        this.monsters.push(this.generateMonster());
        this.monsters.push(this.generateMonster());
        const smallComputer = this.physics.add.sprite(-100, -100, 'computer').setScale(0.05);
        this.physics.add.collider(this.player, smallComputer, (obj1, obj2) => {
            smallComputer.destroy();
            const worldPoint = this.cameras.main.getWorldPoint(40, 40);
            this.computerIcon = this.physics.add.sprite(0, 0, 'computer').setScale(0.03).setPosition(worldPoint.x, worldPoint.y);
            this.computerIcon.setDepth(100);
        });
        // const computer = this.add.image(400, 300, 'computer');
        const particles = this.add.particles('particle').setDepth(30);
        this.rain = particles.createEmitter({
            speedY: 700,
            scaleX: 0.1,
            scaleY: 0.1,
            timeScale: 0.08,
            blendMode: Phaser.BlendModes.ADD,
            maxParticles: 0,
            quantity: 0.4,
            lifespan: 30000,
            alpha: 0.3,
            emitZone: {
                source: new Phaser.Geom.Line(-100, 0, 1800, 0),
            }
        });
        // emitter.startFollow(this.player);
        const camera = this.cameras.main;
        camera.startFollow(this.player);

        this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' }).setDepth(199);

        this.input.keyboard.on('keyup_P', () => {
            console.log('keyup_P');
            if (this.calculateSpriteDistance(this.player, this.baby) < 100 && !this.babyPickedUp) {
                this.babyPickedUp = true;
                this.baby.setPosition(-10000, -10000);
            } else if (this.babyPickedUp) {
                this.babyPickedUp = false;
                this.baby.setPosition(this.player.body.x, this.player.body.y);
            }
        });
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
                this.playPlayerWalkingAnimation();
                this.player.setFlipX(true);
                this.isPlayerFlipped = true;
            }
            if (this.cursors.right.isDown) {
                this.player.setVelocityX(SPEED);
                this.playPlayerWalkingAnimation();
                this.player.setFlipX(false);
                this.isPlayerFlipped = false;
            }
            if (this.cursors.up.isDown) {
                this.player.setVelocityY(-SPEED);
                this.playPlayerWalkingAnimation();
            }
            if (this.cursors.down.isDown) {
                this.player.setVelocityY(SPEED);
                this.playPlayerWalkingAnimation();
            }
            if (this.noCursorIsDown(this.cursors)) {
                this.player.setVelocity(0);
                this.playPlayerIdleAnimation();
            }
            if (this.cursors.space.isDown && this.gunCooldown <= 0) {
                this.gunCooldown = 500;
                const playerX = this.player.body.x;
                const playerY = this.player.body.y;
                const bullet = this.physics.add.sprite(playerX, playerY+20, 'particle').setDepth(20);
                bullet.setTint(0xff0000);
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
            }
            this.player.body.velocity.normalize().scale(SPEED)

            // Exiting fullscreen
            const esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            if (esc.isDown) {
            }
        }
    }

    noCursorIsDown(cursors: Phaser.Input.Keyboard.CursorKeys) {
        return cursors.left.isUp && cursors.right.isUp && cursors.up.isUp && cursors.down.isUp;
    }

    calculateSpriteDistance(sprite1: Phaser.Physics.Arcade.Sprite, sprite2: Phaser.Physics.Arcade.Sprite) {
        const body1 = sprite1.body;
        const body2 = sprite2.body;
        const xDistance = body1.x - body2.x;
        const yDistance = body1.y - body2.y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    playPlayerWalkingAnimation() {
        if (this.babyPickedUp) {
            this.player.anims.play('man-with-baby-walk', true);
        } else {
            this.player.anims.play('walk', true);
        }
    }

    playPlayerIdleAnimation() {
        if (this.babyPickedUp) {
            this.player.anims.play('man-with-baby-idle', true);
        } else {
            this.player.anims.play('idle', true);
        }
    }

    generateMonster() {
        const monster = this.physics.add.sprite(200, 800, 'monster').setDepth(2);
        monster.setRandomPosition(0, 0, 1700, 1700);
        this.anims.create({
            key: 'monster_idle',
            frames: this.anims.generateFrameNumbers('monster', { start: 0, end: 4 }),
            frameRate: 15,
            repeat: -1,
        });
        monster.anims.play('monster_idle', true);
        this.physics.add.collider(this.player, monster, () => {
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
        this.physics.add.collider(monster, this.baby);
        this.physics.add.collider(monster, this.obstacleLayer);
        return monster;
    }
}