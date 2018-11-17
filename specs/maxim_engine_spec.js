/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const expect = require('chai').expect;

const { MaximEngine } = require('../index');

describe("MaximEngine Integration", () => {

    var engine, readAnalyzer, writeAnalyzer;

    beforeEach(() => {
        engine = new MaximEngine();
        readAnalyzer = engine.readOnlyProxyBuilder.propertyUseAnalyzer;
        writeAnalyzer = engine.writeThroughProxyBuilder.propertyUseAnalyzer;
    });

    it("should process a simple rule", () => {
        let initialValue = "initial";
        let transformedValue = "transformed";
        engine.register({
            condition: wm => wm.data === initialValue,
            consequence: wm => wm.data = transformedValue
        });

        let output = engine.execute({data: initialValue});

        expect(output).to.deep.equal({data: transformedValue});
    });

    it("should not be able to mutate working memory in a condition", () => {
        engine.register({
            condition: wm => wm.message = "goodbye",
            consequence: wm => wm
        });

        expect(() => engine.execute({})).to.throw();
    });

    describe("rule chain", () => {

        let sampleRule1 = {
            condition: wm => wm.message === 'hello',
            consequence: wm => wm.message = 'goodbye'
        };

        let sampleRule2 = {
            condition: wm => wm.message === 'goodbye',
            consequence: wm => wm.message = 'au revoir'
        };

        it("should re-evaluate the ruleset once", () => {
            engine.register([sampleRule1, sampleRule2]);
            let wm = engine.execute({message: 'hello'});
            expect(wm.message).to.equal('au revoir');
        });

    });

});