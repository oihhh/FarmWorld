import { handle_player_controls } from "./player_movement.js";
import { setupSocket, socket, remote_players } from "./socket_connection.js"


class farmWorld_farm extends Phaser.scene {
    constructor() {
        super('skyWorld_farm')
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
        this.physics.add.overlap(this.player, this.skyWorldPortal, () => {
            for (const sid in remote_players) {
                remote_players[sid].destroy();
                delete remote_players[sid];
            }
            socket.emit('area_changed', {area: 'skyWorld_hub'})
            this.scene.start('SkyWorld_hub');
        })

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