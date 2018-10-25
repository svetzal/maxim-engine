class PropertyUseAnalyzer {

    constructor() {
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