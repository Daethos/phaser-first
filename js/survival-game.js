import MainScene from './MainScene.js';

const config = {
    width: 512,
    height: 512,
    backgroundColor: '#000', // To see it
    type: Phaser.AUTO,
    parent: 'survival-game', // parent = id of the div
    scene: [MainScene],
    scale: {
        zoom: 2, // How far away you are from the screen
    },
    physics: {
        default: 'matter', // Matter can do more things than default
        matter: {
            debug: true,
            gravity: { y : 0 }, // This is OFF, since it is a top-down and not a platformer
        }
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin.default,
                key: 'matterCollision',
                mapping: 'matterCollision',
            }
        ]
    }
}

new Phaser.Game(config);