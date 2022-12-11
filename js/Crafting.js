import DropItem from "./DropItem.js";
import items from "./Items.js";

export default class Crafting {
    constructor(data) {
        let { mainScene } = data;
        this.mainScene = mainScene;
        this.inventory = mainScene.player.inventory;
        this.player = mainScene.player;
        this.selected = 0;
        this.items = [];
    }

    craft() {
        let item = this.items[this.selected];
        if (item.canCraft) {
            new DropItem({ name: item.name, scene: this.mainScene, x: this.player.x - 32, y: this.player.y, frame: item.frame });
            item.matDetails.forEach(mat => this.inventory.removeItem(mat.name));
        }
    }

    updateItems() {
        this.items = [];
        let craftables = Object.keys(items).filter(i => items[i].mats);
        for (let i = 0; i < craftables.length; i++) {
            const itemName = craftables[i];
            const mats = items[itemName].mats;
            // Now Check to See if there are enough Mats
            let lastMat = "";
            let matDetails = [];
            let canCraft = true;
            let qty = 0;
            mats.forEach(mat => {
                qty = (lastMat === mat) ? qty - 1 : this.inventory.getItemQuantity(mat);
                let available = (qty > 0);
                matDetails.push({ name: mat, frame: items[mat].frame, available });
                lastMat = mat;
                if (!available) canCraft = false;
            });
            this.items.push({ name: itemName, frame: items[itemName].frame, matDetails, canCraft })
        }
        console.log(this.items)
    }
}