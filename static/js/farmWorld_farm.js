import { handle_player_controls } from "./player_movement.js";
import { setupSocket, socket, remote_players } from "./socket_connection.js"
import { TileGrid, TILE_SIZE  } from "./tileGrid.js";

class farmWorld_farm extends Phaser.Scene {
    constructor() {
        super('farmWorld_farm')
    }

    preload() {
        
        this.load.image('player_down', '/static/assets/player_down.png');
        this.load.image('player_up', '/static/assets/player_up.png');
        this.load.image('player_left', '/static/assets/player_left.png');
        this.load.image('table', '/static/assets/outdoor_table.png');
        
    }

    create() {
        
        setupSocket(this);
        this.player = this.physics.add.sprite(750, 730, 'player_down');
        this.skyWorldPortal = this.add.zone(750, 800, 32, 32);     
        this.physics.add.existing(this.skyWorldPortal);
        this.physics.add.overlap(this.player, this.skyWorldPortal, () => {
            for (const sid in remote_players) {
                remote_players[sid].destroy();
                delete remote_players[sid];
            }
            socket.emit('change_area', {area: 'skyWorld_hub'})
            this.scene.start('skyWorld_hub');
        })
         
        this.physics.world.createDebugGraphic();

        this.physics.world.setBounds(0, 0, 1500, 1500);
        this.cameras.main.setBounds(0, 0, 1500, 1500);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(120, 80);

        this.table = this.physics.add.staticSprite(750, 650, 'table');
        this.table.body.setSize(81, 35);
        this.table.body.setOffset(11, 19);
        this.physics.add.collider(this.player, this.table);
        

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


        // Tiling System
        this.tileGrid = new TileGrid();
        this.buildMode = false;

        this.input.keyboard.on('keydown-E', () => {
            this.buildMode = !this.buildMode;
            if (!this.buildMode) this.highlightBox.setVisible(false);
        });
        this.feetDot = this.add.circle(0, 0, 4, 0xff0000);
        this.feetDot.setDepth(999);
        this.highlightBox = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, 0x00ff00, 0.35);
        this.highlightBox.setStrokeStyle(2, 0x00ff00);
        this.highlightBox.setVisible(false);
        this.highlightBox.setDepth(999); // draw above ground tiles
    }

    update(time, delta) {
        handle_player_controls(this, delta)

        const feet = this.getFeetPosition();
        this.feetDot.setPosition(feet.x, feet.y);

        if (this.buildMode) {
            this.updateTileHighlight();
        }

        if (time - this.last_emit > 50) {
            socket.emit('update_clients_data', {
                x: this.player.x,
                y: this.player.y,
                direction: this.playerDirection
            });
            this.last_emit = time;
        }
     
    }

    getFeetPosition() {
        return {
            x: this.player.x,
            y: this.player.y + (this.player.height / 2)
        };
    }

    updateTileHighlight() {
        const feet = this.getFeetPosition();
        const { x: gx, y: gy } = this.tileGrid.worldToGrid(feet.x, feet.y);
        const target = this.getFacingTile(gx, gy, this.playerDirection);
        if (!this.tileGrid.inBounds(target.x, target.y)) {
            this.highlightBox.setVisible(false);
            return; 
        }
        const { px, py } = this.tileGrid.gridToWorld(target.x, target.y);
        this.highlightBox.setPosition(px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        this.highlightBox.setVisible(true);
    }

    getFacingTile(gx, gy, direction) {
        switch (direction) {
            case 'up':    return { x: gx,     y: gy - 1 };
            case 'down':  return { x: gx,     y: gy + 1 };
            case 'left':  return { x: gx - 1, y: gy };
            case 'right': return { x: gx + 1, y: gy };
            default:      return { x: gx,     y: gy };
        }
    }

}


export { farmWorld_farm }