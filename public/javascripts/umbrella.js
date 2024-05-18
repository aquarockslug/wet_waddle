class Example extends Phaser.Scene {
        cursors;
        ship;

        preload() {
                this.load.image('ship', 'assets/sprites/umbrella.png');
                this.load.image('droplet', 'assets/drop.png');
                this.load.image('background', 'assets/landscape.jpg');
                this.load.json("sprites", "sprite-physics.json");
        }

        create() {
                this.add.image(0, 0, 'background').setDepth(-1).setScale(0.5)
                this.ship = this.matter.add.sprite(400, 400, 'ship', null, {
                        shape: this.cache.json.get("sprites")["umbrella"]
                });
                this.matter.add.worldConstraint(this.ship, 0, 0.9, {
                        pointA: {
                                x: 400,
                                y: 500
                        },
                        pointB: {
                                x: -140,
                                y: 0
                        }
                })

                this.ship.setFrictionAir(0.1);
                this.ship.setMass(30);
                this.ship.setScale(0.6)

                this.cursors = this.input.keyboard.createCursorKeys();

                this.createWater()
        }

        update() {
                if (this.cursors.left.isDown) {
                        this.ship.setAngularVelocity(-0.2);
                } else if (this.cursors.right.isDown) {
                        this.ship.setAngularVelocity(0.2);
                }
                this.drops.getChildren().forEach((d) => {
                        d.angle = Phaser.Math.Clamp(d.angle, 0, 45)
                        if (d.y > config.height) this.drops.kill(d)
                })
                this.ship.angle = Phaser.Math.Clamp(this.ship.angle, -135, -45)
        }

        createWater(dropCount = 40, dropsPerSecond = 20, mass = 3) {

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

                const create = (dropGroup, repeat = dropCount - 1) =>
                        dropGroup.createMultiple(repeat)

                this.drops = this.add.group(groupConfig)
                create(this.drops)
                new Phaser.Core.TimeStep(this.game, {
                        forceSetTimeOut: true,
                        target: dropsPerSecond
                }).start((time, delta) => {
                        const drop = this.drops.get(Math.floor(Math.random() * config.width) - 75, -5)
                        // TODO: change rain direction
                        if (drop) drop.active = true
                        drop.angle = 0
                        drop.setVelocityY(0)
                        drop.setVelocityX(3)
                })
        }
}

const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#1b1464',
        parent: 'phaser-example',
        physics: {
                default: 'matter',
                matter: {
                        debug: true,
                }
        },
        scene: Example
};

const game = new Phaser.Game(config);
