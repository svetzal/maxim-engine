class PropertyUseAnalyzer {

    constructor() {
        this.properties = new Set();
    }

    registerProperty(propertyName) {
        this.properties.add(propertyName);
    }

    getReferencedProperties() {
        return Array.from(this.properties.values()).sort();
    }

}

module.exports = PropertyUseAnalyzer;