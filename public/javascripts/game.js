start = function() {
        var config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                backgroundColor: '#1a2d45',
                scene: {
                        preload: preload,
                        create: create,
                        update: update
                },
                physics: {
                        default: 'matter',
                },
        };

        var game = new Phaser.Game(config);

        function preload() {
                // Display loading progress
                var progressBar = this.add.graphics();
                var progressBox = this.add.graphics();
                progressBox.fillStyle(0xffffff, 0.20);
                progressBox.fillRect(config.width / 4, config.height / 2 - 50, 420, 50);

                // Update loading progress
                this.load.on('progress', function(value) {
                        progressBar.clear();
                        progressBar.fillStyle(0xffa500, 1);
                        progressBar.fillRect(config.width / 4 + 10,
                                config.height / 2 + 10 - 50, 400 * value, 30);
                });

                // Remove loading progress when complete
                this.load.on('complete', function() {
                        progressBar.destroy();
                        progressBox.destroy();
                });

                this.load.image('umbrella', 'assets/sprites/umbrella.png');
                this.load.image('player', 'assets/sprites/waddle.png');
                this.load.image('droplet', 'assets/drop.png');
                this.load.image('background', 'assets/landscape.jpg');
                this.load.json("sprites", "sprite-physics.json");
        }

        function create() {
                game.scene.add('Umbrella', new Umbrella(config))
                game.scene.start('Umbrella')
        }

        function update() {}
};
