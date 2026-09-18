import { handle_player_controls } from "./player_movement.js";

class skyWorld_hub extends Phaser.Scene {
    constructor() {
        super('skyWorld_hub');
    }

    preload() {
        this.load.image('player_down', '/static/assets/player_down.png');
        this.load.image('player_up', '/static/assets/player_up.png');
        this.load.image('player_left', '/static/assets/player_left.png');
        this.load.image('spawn_rune_circle', '/static/assets/spawn_rune_circle.png')
        this.load.image('skyWorld_hub_frame', '/static/assets/skyWorld_hub_frame.png')
    }

    create() {
        this.add.image(750, 750, 'skyWorld_hub_frame')
        this.add.image(750, 750, 'spawn_rune_circle')
        this.player = this.physics.add.sprite(750, 730, 'player_down');

        this.physics.world.setBounds(0, 0, 1500, 1500);
        this.cameras.main.setBounds(0, 0, 1500, 1500);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(120, 80);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.inputVector = { x:0, y:0 };

        this.maxSpeed = 200;
        this.smoothing = 8;

        //player bobbing animation variables
        this.bobTimer = 0;
        this.baseScaleY = 1;
        this.baseScaleX = 1;
    }

    update(time, delta) {
        handle_player_controls(this, delta);
    } 
}

export { skyWorld_hub };