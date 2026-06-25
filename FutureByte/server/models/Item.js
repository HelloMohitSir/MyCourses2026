// models/Item.js
const { ObjectId } = require('mongodb');

class Item {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    static validate(data) {
        if (!data.name || data.name.trim() === '') {
            throw new Error('Name is required');
        }
        if (!data.description || data.description.trim() === '') {
            throw new Error('Description is required');
        }
        return true;
    }
}

module.exports = Item;
