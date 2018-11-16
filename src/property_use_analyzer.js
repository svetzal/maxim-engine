/*
 * Copyright (c) 2018 Stacey Vetzal
 */

class PropertyUseAnalyzer {

    constructor() {
        this.reset();
    }

    reset() {
        this.properties = new Set();
    }

    registerProperty(propertyPath) {
        this.properties.add(propertyPath);
    }

    getReferencedProperties() {
        return Array.from(this.properties.values()).sort();
    }

}

module.exports = PropertyUseAnalyzer;