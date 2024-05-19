class Umbrella extends Phaser.Scene {
        cursors;
        umbrella;

        dryness = 100;
        umbrellaSpeed = 0.15;
        difficulty = 2;

        preload() {
                this.load.image('umbrella', 'assets/sprites/umbrella.png');
                this.load.image('player', 'assets/sprites/waddle.png');
                this.load.image('droplet', 'assets/drop.png');
                this.load.image('background', 'assets/landscape.jpg');
                this.load.json("sprites", "sprite-physics.json");
        }

        async create() {
                this.background = this.add.image(
                        config.width / 2, 0, 'background').setDepth(-1).setScale(0.5)
                this.cursors = this.input.keyboard.createCursorKeys();
                this.player = this.createPlayer()
                this.playerFX = this.player.preFX.addColorMatrix();
                this.matter.world.on('collisionstart', (bodyA, bodyB) => {
                        if (bodyA.label == 'Player' || bodyB.label == 'Player')
                                this.dryness -= 2
                })
                await Promise.all([
                        this.createUmbrella(), this.createWater(), this.addPostFx()
                ])
        }

        update() {
                this.scrollBackground()
                this.checkWinCondition()

                // umbrella
                this.umbrella.angle = Phaser.Math.Clamp(this.umbrella.angle, -135, -45)
                if (this.cursors.left.isDown || this.input.activePointer.isDown &&
                        this.input.activePointer.downX < config.width / 2) {
                        this.umbrella.setAngularVelocity(-this.umbrellaSpeed);
                } else if (this.cursors.right.isDown || this.input.activePointer.isDown &&
                        this.input.activePointer.downX > config.width / 2) {
                        this.umbrella.setAngularVelocity(this.umbrellaSpeed);
                }

                // rain
                if (Math.random() < this.difficulty * 0.01) this.rainDir *= -1
                this.playerFX.brightness(this.dryness / 100)
                this.drops.getChildren().forEach((d) => {
                        d.angle = Phaser.Math.Clamp(d.angle, -45, 45)
                        if (d.y > config.height) this.drops.kill(d)
                })
        }

        addPostFx() {
                const camera = this.cameras.main;
                camera.postFX.addTiltShift(0.25, 1.5, 0.001);
        }

        scrollBackground(speed = 3.5) {
                this.background.scale += 0.0002 * speed
                this.background.y -= 0.15 * speed
        }

        checkWinCondition() {
                if (this.dryness <= 25) this.gameEnd('Failure')
                if (this.background.scale >= 1.50) this.gameEnd('Success!')
        }

        gameEnd(outcome) {
                this.add.text(config.width / 4, config.height / 4, outcome, {
                        fontSize: '96px',
                        color: 'rgb(255, 255, 255)'
                });
                this.scene.pause()
        }

        createPlayer() {
                return this.matter.add.sprite(370, 550, 'player', null, {
                        label: 'Player',
                        shape: 'circle',
                        circleRadius: 700,
                        isSensor: true,
                        isStatic: true,
                        restitution: 1
                }).setScale(0.1).setDepth(2)
        }

        createUmbrella() {
                this.umbrella = this.matter.add.sprite(400, 400, 'umbrella', null, {
                        shape: this.cache.json.get("sprites")["umbrella"],
                        mass: 30
                });
                this.umbrella.setFrictionAir(0.1);
                this.umbrella.setScale(0.6).setDepth(1)
                this.matter.add.worldConstraint(this.umbrella, 0, 1, {
                        pointA: {
                                x: config.width / 2,
                                y: config.height - config.height / 4
                        },
                        pointB: {
                                x: -100,
                                y: 0
                        }
                })
        }

        createWater(dropCount = 50, dropsPerSecond = 50, mass = 3) {
                const groupConfig = {
                        maxSize: dropCount,
                        createCallback: (drop) => {
                                this.matter.add.gameObject(drop, {
                                        shape: 'circle',
                                        friction: 0,
                                        mass
                                }, true)
                                drop.setScale(0.1).setTexture('droplet')
                        }
                }
                this.drops = this.add.group(groupConfig)
                this.drops.createMultiple(dropCount)
                this.rainDir = -1
                new Phaser.Core.TimeStep(this.game, {
                        forceSetTimeOut: true,
                        target: dropsPerSecond
                }).start((time, delta) => {
                        const dropPosX = Math.floor(Math.random() * config.width * 2) -
                                (config.width * this.rainDir) - 100
                        const drop = this.drops.get(dropPosX, -20)
                        if (!drop) return
                        drop.active = true
                        drop.angle = 45 * this.rainDir * -1
                        drop.setVelocityY(0).setVelocityX(22 * this.rainDir)
                })
        }
}

const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#3440a6',
        physics: {
                default: 'matter',
                matter: {
                        // debug: true
                }
        },
        scene: Umbrella
};

const game = new Phaser.Game(config);
