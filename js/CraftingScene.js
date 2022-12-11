import UIBaseScene from "./UIBaseScene.js";

export default class CraftingScene extends UIBaseScene {
    constructor() {
        super('CraftingScene');
        this.craftingSlots = [];
        this.uiScale = 1.0;
    }

    init(data) {
        let { mainScene } = data;
        this.mainScene = mainScene;
        this.crafting = mainScene.crafting;
        this.crafting.inventory.subscribe(() => this.updateCraftableSlots());


    }

    create() {
        this.updateCraftableSlots();
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.crafting.selected = Math.max(0, this.crafting.selected + (deltaY > 0 ? 1 : -1)) % this.crafting.items.length;
            this.updateSelected();
        });

        this.input.keyboard.on('keydown-E', () => {
            this.crafting.craft();
        });
    }

    updateSelected() {
        for (let i = 0; i < this.crafting.items.length; i++) {
            this.craftingSlots[i].tint = this.crafting.selected === i ? 0xffff00 : 0xffffff
        }
    }

    destroyCraftingSlot(craftingSlot) {
        craftingSlot.matItems.forEach(m => m.destroy());
        craftingSlot.item.destroy();
        craftingSlot.destroy();
    }

    updateCraftableSlots() {
        this.crafting.updateItems();

        for (let i = 0; i < this.crafting.items.length; i++) {
            if (this.craftingSlots[i]) this.destroyCraftingSlot(this.craftingSlots[i]);
            const craftableItem = this.crafting.items[i];
            let x = this.margin + this.tileSize / 2;
            let y = i * this.tileSize + this.game.config.height / 2;
            this.craftingSlots[i] = this.add.sprite(x, y, 'items', 11);
            this.craftingSlots[i].item = this.add.sprite(x, y, 'Items', craftableItem.frame);
            this.craftingSlots[i].item.tint = craftableItem.canCraft ? 0xffffff : 0x55555;
            this.craftingSlots[i].matItems = [];
            for (let j = 0; j < craftableItem.matDetails.length; j++) {
                const matItem = craftableItem.matDetails[j];
                let scale = 0.75;
                this.craftingSlots[i].matItems[j] = this.add.sprite(x + this.tileSize + j * this.tileSize * scale, y, 'Items', matItem.frame);
                this.craftingSlots[i].matItems[j].setScale(scale);
                this.craftingSlots[i].matItems[j].tint = matItem.available ? 0xffffff : 0x55555;
            }
        }

    }
}