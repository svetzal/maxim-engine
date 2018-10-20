const expect = require('chai').expect;

const PropertyUseAnalyzer = require('../src/property_use_analyzer');

describe('PropertyUseAnalyzer', () => {

    let analyzer;

    beforeEach(() => {
        analyzer = new PropertyUseAnalyzer();
    });

    it('should register a property', () => {
        analyzer.registerProperty('message');
        expect(analyzer.getReferencedProperties()).to.deep.equal(['message']);
    });

    it('should only register a property once', () => {
        analyzer.registerProperty('message');
        analyzer.registerProperty('message');
        expect(analyzer.getReferencedProperties()).to.deep.equal(['message']);
    });

    it('should register more than one property', () => {
        analyzer.registerProperty('message');
        analyzer.registerProperty('key');
        expect(analyzer.getReferencedProperties()).to.deep.equal(['key','message']);
    });

});