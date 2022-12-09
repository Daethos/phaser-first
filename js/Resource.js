import DropItem from "./DropItem.js";
import MatterEntity from "./MatterEntity.js";

export default class Resource extends MatterEntity {
    
    static preload(scene) {
        scene.load.atlas('resources', 'assets/images/resources.png', 'assets/images/resources_atlas.json');
        scene.load.audio('tree', 'assets/audio/tree.mp3');
        scene.load.audio('bush', 'assets/audio/bush.mp3');
        scene.load.audio('rock', 'assets/audio/rock.mp3');
        scene.load.audio('pickup', 'assets/audio/pickup.mp3');
    }

    constructor(data) {
        let { scene, resource } = data;
        console.log(resource, 'Resource')
        let type = resource?.properties?.find((p) => p?.name === 'Type')?.value;
        // super (scene.matter.world, resource.x, resource.y, 'resources', type);
        let drops = JSON.parse(resource?.properties?.find(p => p?.name === 'drops')?.value);
        let depth = resource.properties.find(p => p.name === 'depth').value;
        super ({ scene, x: resource.x, y: resource.y, texture: 'resources', frame: type, drops, depth, health: 5, name: type });
        // this.scene.add.existing(this);

        let yOrigin = resource?.properties?.find((p) => p?.name === 'yOrigin')?.value;
        // this.name = type;
        // this.health = 5;
        // this.sound = this.scene.sound.add(this.name);
        // this.x += this.width / 2;
        // this.y -= this.height / 2;
        this.y = this.y + this.height * (yOrigin - 0.5);
        
        const { Bodies } = Phaser.Physics.Matter.Matter;
        let circleCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'collider' });
        this.setExistingBody(circleCollider);
        
        this.setStatic(true);
        this.setOrigin(0.5, yOrigin);
    }
}