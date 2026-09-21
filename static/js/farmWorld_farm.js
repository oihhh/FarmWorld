import { handle_player_controls } from "./player_movement.js";
import { setupSocket, socket, remote_players } from "./socket_connection.js"


class farmWorld_farm extends Phaser.Scene {
    constructor() {
        super('farmWorld_farm')
    }

    preload() {
        
        this.load.image('player_down', '/static/assets/player_down.png');
        this.load.image('player_up', '/static/assets/player_up.png');
        this.load.image('player_left', '/static/assets/player_left.png');
        
    }

    create() {
        
        setupSocket(this);
        this.player = this.physics.add.sprite(750, 730, 'player_down');
        this.skyWorldPortal = this.add.zone(750, 750, 32, 32);     
        this.physics.add.existing(this.skyWorldPortal);
        this.physics.add.overlap(this.player, this.skyWorldPortal, () => {
            for (const sid in remote_players) {
                remote_players[sid].destroy();
                delete remote_players[sid];
            }
            socket.emit('area_changed', {area: 'skyWorld_hub'})
            this.scene.start('SkyWorld_hub');
        })

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

        this.last_emit = 0;
        this.playerDirection = 'down'

    }

    update(time, delta) {
        handle_player_controls(this, delta)

        if (time - this.last_emit > 50) {
            socket.emit('update_clients_data', {
                x: this.player.x,
                y: this.player.y,
                direction: this.playerDirection
            });
            this.last_emit = time;
        }
    }
}


export { farmWorld_farm }