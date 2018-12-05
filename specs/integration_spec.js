/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const expect = require('chai').expect;

const {MaximEngine} = require('../index');

describe("MaximEngine Public Functionality", () => {

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

    xdescribe("prioritization", () => {

        let rules = [
            {
                priority: 100,
                condition: wm => wm.value === 1,
                consequence: wm => wm.value = 100
            },
            {
                priority: 1,
                condition: wm => wm.value === 1,
                consequence: wm => wm.value = 10
            }
        ];

        it("should evaluate the rules in priority order", () => {
            engine.register(rules);
            let wm = engine.execute({value: 1});
            expect(wm.value).to.equal(100);
        });

    });

});