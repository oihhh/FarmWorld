class skyWorld_hub extends Phaser.Scene {
    constructor() {
        super('skyWorld_hub');
    }

    preload() {
        this.load.image('player_down', '/static/assets/player_down.png');
        this.load.image('player_up', '/static/assets/player_up.png');
        this.load.image('player_left', '/static/assets/player_left.png');
    }

    create() {
        this.player = this.physics.add.sprite(100, 100, 'player_down');

        this.physics.world.setBounds(0, 0, 1500, 1500);
        this.cameras.main.setBounds(0, 0, 1500, 1500);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(120, 80);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.inputVector = { x:0, y:0 };

        this.maxSpeed = 200;
        this.smoothing = 8;
    }

    update(time, delta) {
        const dt = delta/1000;

        let targetX = 0;
        let targetY = 0;

        if (this.cursors.left.isDown) targetX = -1;
        if (this.cursors.right.isDown) targetX = 1;
        if (this.cursors.up.isDown) targetY = -1;
        if (this.cursors.down.isDown) targetY = 1;

        this.inputVector.x = Phaser.Math.Linear(
            this.inputVector.x, targetX, 1 - Math.pow(1 - this.smoothing * dt, 1)
        );
        this.inputVector.y = Phaser.Math.Linear(
            this.inputVector.y, targetY, 1 - Math.pow(1 - this.smoothing * dt, 1)
        );

        let vec = new Phaser.Math.Vector2(this.inputVector.x, this.inputVector.y);
        if (vec.length() > 1) vec.normalize();

        this.player.setVelocity(vec.x * this.maxSpeed, vec.y * this.maxSpeed);



    } 
}

export { skyWorld_hub };