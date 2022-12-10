import Inventory from "./Inventory.js";
import MatterEntity from "./MatterEntity.js";

export default class Player extends MatterEntity {
    constructor (data) {
        let { scene, x, y, texture, frame } = data;
        super ({...data, health: 20, drops: [], name: 'player'}); // Cannot user 'this' until SUPER is called
        this.touching = [];
        this.inventory = new Inventory();

        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'Items', 91);
        this.spriteWeapon.setScale(0.8);
        this.spriteWeapon.setOrigin(0.25, 0.75);
        this.scene.add.existing(this.spriteWeapon)

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        let playerCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'playerCollider' });
        let playerSensor = Bodies.circle(this.x, this.y, 24, { isSensor: true, label: 'playerSensor' });
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.CreateMiningCollision(playerSensor);
        this.CreatePickupCollisions(playerCollider);
        this.scene.input.on('pointermove', pointer => { if (!this.dead) this.setFlipX(pointer.worldX < this.x)});
    }

    static preload(scene) {
        scene.load.atlas('elven_knight', 'assets/images/elven_knight.png', 'assets/images/elven_knight_atlas.json')
        scene.load.animation('elven_knight_anim', 'assets/images/elven_knight_anim.json')
        scene.load.spritesheet('Items', 'assets/images/Items.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.spritesheet('items', 'assets/images/items.png', { frameWidth: 32, frameHeight: 32 });
        scene.load.audio('player', 'assets/audio/player.mp3')
    }

    onDeath = () => {
        this.anims.stop();
        this.setTexture('Items', 0);
        this.setOrigin(0.5);
        this.spriteWeapon.destroy();
    }

    update() {
        if (this.dead) return;

        if (this.inventory.selectedItem) {
            this.spriteWeapon.setTexture('Items', this.inventory.getItemFrame(this.inventory.selectedItem));
            this.spriteWeapon.setVisible(true);
        } else {
            this.spriteWeapon.setVisible(false);
        }

        const speed = 2.5;
        let playerVelocity = new Phaser.Math.Vector2();
        if (this.inputKeys.left.isDown) {
            playerVelocity.x = -1;
        } else if (this.inputKeys.right.isDown) {
            playerVelocity.x = 1;
        }
        if (this.inputKeys.up.isDown) {
            playerVelocity.y = -1;
        } else if (this.inputKeys.down.isDown) {
            playerVelocity.y = 1;
        }
        playerVelocity.normalize();
        playerVelocity.scale(speed);
        this.setVelocity(playerVelocity.x, playerVelocity.y);
        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            this.anims.play('elven_knight_walk', true);
        } else {
            this.anims.play('elven_knight_idle', true);
        }
        this.spriteWeapon.setPosition(this.x, this.y)
        this.weaponRotate();
    }

    weaponRotate() {
        let pointer = this.scene.input.activePointer;
        if (pointer.isDown) {
            this.weaponRotation += 6;
        } else {
            this.weaponRotation = 0;
        }
        if (this.weaponRotation > 100) {
            this.whackStuff();
            this.weaponRotation = 0;
        }

        if (this.flipX) {
            this.spriteWeapon.setAngle(-this.weaponRotation - 90);
        } else {
            this.spriteWeapon.setAngle(this.weaponRotation);
        }
    }

    CreateMiningCollision(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: other => {
                if (other.bodyB.isSensor) return;
                this.touching.push(other.gameObjectB);
                console.log(this.touching.length, other.gameObjectB.name);
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerSensor],
            callback: other => {
                this.touching = this.touching.filter(gameObject => gameObject !== other.gameObjectB)
                console.log(this.touching.length);
            },
            context: this.scene,
        })
    }

    CreatePickupCollisions(playerCollider) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerCollider],
            callback: other => {
               if (other.gameObjectB && other.gameObjectB.pickup) 
                if (other.gameObjectB.pickup()) this.inventory.addItem({ name: other.gameObjectB.name, quantity: 1 });

            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideActive({
            objectA: [playerCollider],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.pickup)
                    if (other.gameObjectB.pickup()) this.inventory.addItem({ name: other.gameObjectB.name, quantity: 1 });
            },
            context: this.scene,
        })
    }

    whackStuff() {
        this.touching = this.touching.filter(gameObject => gameObject.hit && !gameObject.dead);
        this.touching.forEach(gameobject => {
            gameobject.hit();
            if (gameobject.dead) gameobject.destroy();
        })
    }
}