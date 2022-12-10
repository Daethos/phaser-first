// import Phaser from "phaser";

import Enemy from "./Enemy.js";
import Player from "./Player.js";
import Resource from "./Resource.js";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.enemies = [];
    }

    preload() {
        Player.preload(this);
        Enemy.preload(this);
        Resource.preload(this);
        this.load.image('tiles', 'assets/images/RPG Nature Tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/images/map.json')
    }

    create() {
        this.input.setDefaultCursor('url(assets/images/cursor.png), pointer')
        const map = this.make.tilemap({ key: 'map' });
        this.map = map;
        const tileset = map.addTilesetImage('RPG Nature Tileset', 'tiles', 32, 32, 0, 0);
        const layer1 = map.createLayer('Tile Layer 1', tileset, 0, 0);
        const layer2 = map.createLayer('Tile Layer 2', tileset, 0, 0);
        layer1.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer1);
        
        this.map.getObjectLayer('Resources').objects.forEach(resource =>  new Resource({scene:this, resource}));
        this.map.getObjectLayer('Enemies').objects.forEach(enemy =>  this.enemies.push(new Enemy({scene:this, enemy})));

        this.player = new Player({scene: this, x:100, y:100, texture: 'elven_knight', frame: 'elvenknight_idle_1'});
        // let textPlayer = new Player({scene: this, x:100, y:100, texture: 'elven_knight', frame: 'elvenknight_idle_1'});
        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        })
        let camera = this.cameras.main;
        camera.zoom = 1.25;
        camera.startFollow(this.player);
        camera.setLerp(0.1, 0.1);
        camera.setBounds(0, 0, this.game.config.width, this.game.config.height);
        this.scene.launch('InventoryScene', { mainScene: this });
    }

    update() {
        this.enemies.forEach(enemy => enemy.update());
        this.player.update();
    }
}