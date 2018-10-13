[![Build Status](https://travis-ci.org/svetzal/maxim-engine.svg?branch=master)](https://travis-ci.org/svetzal/maxim-engine)
[![Code Quality](https://api.codeclimate.com/v1/badges/ce3c1b2c628677b1c330/maintainability)](https://codeclimate.com/github/svetzal/maxim-engine/maintainability)

# Maxim Engine

Maxim is a simple rule engine, really simple for now. I'd like one day to make it better, but I haven't yet.

## Limitations

- will only run through ruleset once, if rules change working memory things won't re-fire
- probably more I haven't thought of...

## Usage

Initialize yourself an instance of the `MaximEngine`

```js
let engine = new MaximEngine();
```

Rules have two components, a `condition` and a `consequence`. Each component needs a lambda that takes an instance of the engine's Working Memory 

A `condition` is a lambda that takes an instance of the engine's Working Memory and returns a boolean value that indicates to the engine that the consequence applies.

eg. `(wm) => typeof(wm.message) !== 'undefined'`

A `consequence` is a lambda that mutates the provided working memory (which is actually a copy of the original working memory in order to avoid side-effects).

eg. `(wm) => wm.message = "Hello, World!"`

So here is an example of a complete rule:

```js
let rule = {
    condition: (wm) => typeof(wm.message) !== 'undefined',
    consequence: (wm) => wm.message = "Hello, World!"
};
```

Once you have a set of rules you can register them with the engine. You can provide a single rule or an array of rules.

```js
engine.register(rule);
```

Once you have loaded your rules into the engine, you can use it as many times as you'd like with different input data.

```js
let result = engine.execute({ message: "Change me!" });
console.log(result.message); // Outputs "Hello, World!"
```