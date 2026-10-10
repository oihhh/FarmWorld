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
        this.load.image('grass', '/static/assets/grass_tile_test.png')
        
    }

    create() { 
        this.changingArea = false;
        
        setupSocket(this);
        
        this.player = this.physics.add.sprite(750, 730, 'player_down');
        this.player.body.setSize(20, 14);
        this.player.body.setOffset(0, 33)
        
        this.physics.world.setBounds(0, 0, 1500, 1500);
        this.cameras.main.setBounds(0, 0, 1500, 1500);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(120, 80);

        this.physics.world.createDebugGraphic();

        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-E', () => {
            this.buildMode = !this.buildMode;
            if (!this.buildMode) this.highlightBox.setVisible(false);
        });

        this.input.keyboard.on('keydown-F', () => {
            if (this.buildMode) {
                const feet = this.getFeetPosition();
                const {x: gx, y: gy} = this.tileGrid.worldToGrid(feet.x, feet.y)
                const { px, py } = this.tileGrid.gridToWorld(gx, gy);
                this.add.image(px, py, 'grass')

            }
        })

        this.feetDot = this.add.circle(0, 0, 4, 0xff0000);
        this.feetDot.setDepth(999);
        this.highlightBox = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, 0x00ff00, 0.35);
        this.highlightBox.setStrokeStyle(2, 0x00ff00);
        this.highlightBox.setVisible(false);
        this.highlightBox.setDepth(999); // draw above ground tiles

        // Tiling System
        this.tileGrid = new TileGrid();
        this.buildMode = false;
         
        this.maxSpeed = 200;
        this.smoothing = 8;
        this.last_emit = 0;
        this.playerDirection = 'down'
        this.inputVector = new Phaser.Math.Vector2(0, 0);


        //PORTAL TO SKY_WORLD
        this.skyWorldPortal = this.add.zone(750, 800, 32, 32);     
        this.physics.add.existing(this.skyWorldPortal);
        this.physics.add.overlap(this.player, this.skyWorldPortal, () => {
            if (this.changingArea) return;
            this.changingArea = true;
            for (const sid in remote_players) {
                remote_players[sid].destroy();  //This destroy client cache remoteplayers data so they dont render in new area 
                delete remote_players[sid];
            }
            socket.emit('change_area', {area: 'skyWorld_hub'})
            this.scene.start('skyWorld_hub');
        })
        
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
            y: this.player.y + (this.player.height / 3)
        };
    }

    updateTileHighlight() {
        const feet = this.getFeetPosition();
        const { x: gx, y: gy } = this.tileGrid.worldToGrid(feet.x, feet.y);

        if (!this.tileGrid.inBounds(gx, gy)) {
            this.highlightBox.setVisible(false);
            return; 
        }

        const { px, py } = this.tileGrid.gridToWorld(gx, gy);
        this.highlightBox.setPosition(px + TILE_SIZE / 2, py + TILE_SIZE / 2); // rectangles default to origin (0.5, 0.5), so position = center, not top-left
        this.highlightBox.setVisible(true);                                    // using px, py directly would shift the highlight up and left by half a tile
                                                                               // adding TILE_SIZE / 2 moves the center to the middle of the tile
    }


}


export { farmWorld_farm }



