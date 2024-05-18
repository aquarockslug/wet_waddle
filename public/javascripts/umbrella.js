class Umbrella extends Phaser.Scene {
        cursors;
        umbrella;

        preload() {
                this.load.image('umbrella', 'assets/sprites/umbrella.png');
                this.load.image('player', 'assets/sprites/waddle.png');
                this.load.image('droplet', 'assets/drop.png');
                this.load.image('background', 'assets/landscape.jpg');
                this.load.json("sprites", "sprite-physics.json");
        }

        create() {
                this.add.image(400, 0, 'background').setDepth(-1).setScale(0.5)
                this.cursors = this.input.keyboard.createCursorKeys();
                this.player = this.createPlayer()
                this.playerFX = this.player.preFX.addColorMatrix();
                this.createUmbrella()
                this.createWater()
                this.dryness = 100
                this.matter.world.on('collisionstart', (bodyA, bodyB) => {
                        if (bodyA.label == 'Player' || bodyB.label == 'Player')
                                this.dryness -= 1
                })
        }

        update() {
                if (this.cursors.left.isDown) {
                        this.umbrella.setAngularVelocity(-0.1);
                } else if (this.cursors.right.isDown) {
                        this.umbrella.setAngularVelocity(0.1);
                }
                this.drops.getChildren().forEach((d) => {
                        d.angle = Phaser.Math.Clamp(d.angle, -45, 45)
                        if (d.y > config.height) this.drops.kill(d)
                })
                this.umbrella.angle = Phaser.Math.Clamp(this.umbrella.angle, -135, -45)
                if (Math.random() < 0.005) this.rainDir *= -1
                this.playerFX.brightness(this.dryness / 100)
        }

        createPlayer() {
                return this.matter.add.sprite(365, 575, 'player', null, {
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
                this.matter.add.worldConstraint(this.umbrella, 0, 0.9, {
                        pointA: {
                                x: 400,
                                y: 500
                        },
                        pointB: {
                                x: -140,
                                y: 0
                        }
                })
        }

        createWater(dropCount = 80, dropsPerSecond = 40, mass = 3) {
                const groupConfig = {
                        maxSize: dropCount,
                        createCallback: (drop) => {
                                this.matter.add.gameObject(drop, {
                                        shape: 'circle',
                                        ignorePointer: true,
                                        friction: 0,
                                        // angular velocity dampen
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
                        if (drop) drop.active = true
                        drop.angle = 45 * this.rainDir * -1
                        drop.setVelocityY(0).setVelocityX(22 * this.rainDir)
                })
        }
}

const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#1b1464',
        physics: {
                default: 'matter',
                matter: {
                        debug: true,
                }
        },
        scene: Umbrella
};

const game = new Phaser.Game(config);
