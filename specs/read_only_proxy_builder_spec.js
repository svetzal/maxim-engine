const expect = require('chai').expect;

const ReadOnlyProxyBuilder = require('../src/read_only_proxy_builder');
const PropertyUseAnalyzer = require('../src/property_use_analyzer');

describe('ReadOnlyProxyBuilder', () => {

    let builder;
    let listener;

    beforeEach(() => {
        listener = new PropertyUseAnalyzer();
        builder = new ReadOnlyProxyBuilder(listener);
    });

    describe('top level properties', () => {

        // todo: This will pass for some reason even when no "set" trap? defineProperty seems to catch it.
        it('should not allow setting a property', () => {
            let proxy = builder.build({message: "blah"});
            expect(() => proxy.message = "something else").to.throw();
        });

        it('should not allow creating a property', () => {
            let proxy = builder.build({});
            expect(() => {
                return Object.defineProperty(proxy, 'message', {value: 'created'});
            }).to.throw();
        });

        it('should not allow removing a property', () => {
            let proxy = builder.build({message: "blah"});
            expect(() => delete proxy.message).to.throw();
        });

    });

    describe("nested objects", () => {

        it('should not allow setting a property in a nested object', () => {
            let proxy = builder.build(
                {
                    obj: {
                        message: "hello"
                    }
                }
            );
            expect(() => proxy.obj.message = "blah").to.throw();
        });

        it('should not allow creating a property', () => {
            let proxy = builder.build({ obj: {} });
            expect(() => Object.defineProperty(proxy.obj, 'message', {value: 'created'})).to.throw();
        });

        it('should not allow deleting a property', () => {
            let proxy = builder.build({ obj: { message: "blah" } });
            expect(() => delete proxy.obj.message).to.throw();
        });

        it('should handle many nests', () => {
            let proxy = builder.build({
                obj: {
                    thing1: {
                        blah: {
                            message: 'Hello!'
                        }
                    },
                    thing2: {
                        halb: {
                            message: 'Goodbye!'
                        }
                    }
                }
            });
            expect(() => proxy.obj.thing1.blah.message = "blah").to.throw();
            expect(() => proxy.obj.thing2.halb.message = "blah").to.throw();
            expect(() => proxy.obj.thing2 = {}).to.throw();
        });

    });

    describe('works with a property listener', () => {

        it('should register single property usage', () => {
            let proxy = builder.build({ key: 123, message: 'hello' });
            let a = proxy.message;
            expect(listener.getReferencedProperties()).to.deep.equal(['message']);
        });

        it('should register multiple property usages', () => {
            let proxy = builder.build({ key: 123, message: 'hello' });
            let a = proxy.message;
            let b = proxy.key;
            expect(listener.getReferencedProperties()).to.deep.equal(['key', 'message']);
        });

        it('should register nested property usages', () => {
            let proxy = builder.build({ key: 123, obj: { message: 'hello' } } );
            let a = proxy.obj.message;
            expect(listener.getReferencedProperties()).to.deep.equal(['message','obj']);
        });

        it('should discern nested properties of the same name', () => {
            let proxy = builder.build({ a: { message: 'one' }, b: { message: 'two' } });
            let one = proxy.a.message;
            // TODO: Need to have a mechanism to discern these, thinking properties should have a path ref ie. ['a', 'message']
            expect(listener.getReferencedProperties()).to.deep.equal(['a', 'message']);
        });

    });

});