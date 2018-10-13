const expect = require('chai').expect;

const RuleEngine = require('../src/rule_engine');

describe("RuleEngine", () => {

    var engine;

    beforeEach(() => {
        engine = new RuleEngine();
    });

    it("should register a single rule", () => {
        let rule = {};
        engine.register(rule);
        expect(engine.ruleCount()).to.equal(1);
    });

    it("should register multiple different rules", () => {
        let rule1 = {};
        let rule2 = {};
        engine.register([rule1, rule2]);
        expect(engine.ruleCount()).to.equal(2);
    });

    it("should not allow registering the same rule twice", () => {
        let rule = {};
        expect(() => {
            engine.register([rule, rule]);
        }).to.throw();
    });

    it("should pass working memory unchanged when no rules", () => {
        let workingMemory = {data: "thingie"};
        expect(engine.execute(workingMemory)).to.deep.equal(workingMemory);
    });

    it("should process a simple rule", () => {
        let initialValue = "initial";
        let transformedValue = "transformed";
        engine.register({
            condition: (wm) => wm.data === initialValue,
            consequence: (wm) => wm.data = transformedValue
        });

        let output = engine.execute({data: initialValue});

        expect(output).to.deep.equal({data: transformedValue});
    });

});