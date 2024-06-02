class Umbrella extends Phaser.Scene {
        dryness = 100;
        umbrellaSpeed = 0.2;
        difficulty = 2;

        constructor(config) {
                super({
                        key: 'Umbrella'
                })
                this.config = config
        }

        async create() {
                this.background = this.add.image(
                        this.config.width / 2, -800, 'background').setDepth(-1).setScale(1.5)
                this.cursors = this.input.keyboard.createCursorKeys();
                this.player = this.createPlayer()
                this.playerFX = this.player.preFX.addColorMatrix();
                this.matter.world.on('collisionstart', (bodyA, bodyB) => {
                        if (bodyA.label == 'Player' || bodyB.label == 'Player')
                                this.dryness -= 2
                })
                await Promise.all([this.createWater(), this.addPostFx()])
                this.umbrella = this.createUmbrella()
        }

        update() {
                this.scrollBackground()
                this.checkWinCondition()

                // umbrella
                if (!this.umbrella) return
                this.umbrella.angle = Phaser.Math.Clamp(this.umbrella.angle, -135, -45)
                if (this.cursors.left.isDown || this.input.activePointer.isDown &&
                        this.input.activePointer.downX < this.config.width / 2) {
                        this.umbrella.setAngularVelocity(-this.umbrellaSpeed);
                } else if (this.cursors.right.isDown || this.input.activePointer.isDown &&
                        this.input.activePointer.downX > this.config.width / 2) {
                        this.umbrella.setAngularVelocity(this.umbrellaSpeed);
                }

                // rain
                if (Math.random() < this.difficulty * 0.01) this.rainDir *= -1
                this.playerFX.brightness(this.dryness / 100)
                this.drops.getChildren().forEach((d) => {
                        d.angle = Phaser.Math.Clamp(d.angle, -45, 45)
                        if (d.y > this.config.height) this.drops.kill(d)
                })
        }

        addPostFx() {
                const camera = this.cameras.main;
                camera.postFX.addVignette(0.5, 0.5, 0.8);
        }

        scrollBackground(speed = 8) {
                this.background.scale -= 0.0001 * speed
                this.background.y += 0.08 * speed
        }

        checkWinCondition() {
                if (this.dryness <= 25) this.gameEnd('Failure')
                if (this.background.scale <= 0.5) this.gameEnd('Success!')
        }

        async gameEnd(outcome) {
                const outcomeText = this.add.text(
                        this.config.width / 4,
                        this.config.height / 4,
                        outcome, {
                                fontFamily: 'serif',
                                fontSize: 96
                        }
                )
                this.scene.pause('Umbrella')
        }

        createPlayer() {
                return this.matter.add.sprite(this.config.width / 2 - 25, this.config.height - 50, 'player', null, {
                        label: 'Player',
                        shape: 'circle',
                        circleRadius: 700,
                        isSensor: true,
                        isStatic: true,
                        restitution: 1
                }).setScale(0.07).setDepth(2)
        }

        createUmbrella() {
                const umbrella = this.matter.add.sprite(400, 400, 'umbrella', null, {
                        shape: this.cache.json.get("sprites")["umbrella"],
                        mass: 30
                });
                umbrella.setFrictionAir(0.1);
                umbrella.setScale(0.5).setDepth(1)
                this.matter.add.worldConstraint(umbrella, 0, 1, {
                        pointA: {
                                x: this.config.width / 2,
                                y: this.config.height - this.config.height / 4 + 20
                        },
                        pointB: {
                                x: -100,
                                y: 0
                        }
                })
                return umbrella
        }

        createWater(dropCount = 66, dropsPerSecond = 100, mass = 10) {
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
                        const dropPosX = Math.floor(Math.random() * this.config.width * 2) -
                                (this.config.width * this.rainDir) - 100
                        const drop = this.drops.get(dropPosX, -20)
                        if (!drop) return
                        drop.active = true
                        drop.angle = 45 * this.rainDir * -1
                        drop.setVelocityY(0).setVelocityX(22 * this.rainDir)
                })
        }
}
