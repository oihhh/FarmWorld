import { skyWorld_hub } from "./skyWorld_hub.js";

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 700,
        height: 300,
    },
    scene: [skyWorld_hub]
};

new Phaser.Game(config);
