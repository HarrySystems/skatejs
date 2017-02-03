# `h`

The `h` export allows you to write virtual DOM using a [Hyperscript](https://github.com/dominictarr/hyperscript)-like API. This also adds first-class JSX support so you can just set the JSX `pragma` to `h` and carry on building stuff.



## `Hyperscript`

You can use the `h` export to write Hyperscript:

```js
customElements.define('my-component', class extends skate.Component {
  renderCallback () {
    return skate.h('p', { style: { fontWeight: 'bold' } }, 'Hello!');
  }
});
```

*Currently id / class selectors are not supported, but [will be soon](https://github.com/skatejs/skatejs/issues/807).*



## `JSX`

The `h` export also allows you to write JSX out of the box. All you have to do is include the [standard babel transform](https://babeljs.io/docs/plugins/transform-react-jsx/).



### Setting `pragma`

It's preferred that you set the JSX `pragma` to `h` (or `skate.h` if you're using globals), if possible, so that you don't confuse anyone by using the default `React.createElement()` in a non-React app.

```js
// .babelrc
{
  "plugins": [
    ["transform-react-jsx", {
      "pragma": "h"
    }]
  ]
}

// my-component.js
import { Component, h } from 'skatejs';

customElements.define('my-component', class extends Component {
  renderCallback () {
    return <p>Hello!</p>;
  }
});
```



### Default `React.createElement()`

If you don't have control over the `pragma`, you can get around it by defining the `React.createElement()` interface with the `h` export.

```js
import { Component, h } from 'skatejs';
const React = { createElement: h };
customElements.define('my-component', class extends Component {
  renderCallback () {
    return <p>Hello!</p>;
  }
});
```



### Other ways to use JSX

You can also enable JSX support in a couple of other ways, though they require slightly more work:

- https://github.com/thejameskyle/incremental-dom-react-helper - Allows `React.createElement()` calls to translate to Incremental DOM calls.
- https://github.com/jridgewell/babel-plugin-incremental-dom - Babel plugin for transpiling JSX to Incremental DOM calls.

```js
// Incremental DOM needs to be available globally, so you'll have to do:
IncrementalDOM = skate.vdom;

// For the plugin you need to configure the `prefix` option to
// point to Skate's `vdom` or you'll need to do something like this
// so the functions are in scope.
const { elementOpen, elementOpenStart, elementVoid } = skate.vdom;

customElements.define('my-component', class extends skate.Component {
  static get props () {
    return {
      title: skate.prop.string()
    };
  }
  renderCallback () {
    return (
      <div>
        <h1>{this.title}</h1>
        <slot name="description" />
        <article>
          <slot />
        </article>
      </div>
    );
  }
});
```



### Passing nodes from other virtual DOM libraries

The `h()` function also understands other virtual DOM libraries. What this means is that you can pass a virtual node created in a nother virtual DOM library directly into `h()` as children, and it will convert it to something that it understands.

For example, you might do the following in React:

`custom-element.js`

```js
/** @jsx h **/
import { Component, define, h } from 'skatejs';

export default define(class extends Component {
  static props = {
    tbody: {}
  }
  renderCallback ({ tbody }) {
    return (
      <table>{tbody}</table>
    );
  }
});
```

`react-element.js`

```js
/** @jsx React.createElement */

import React from 'the-gist-above-that-patches-react';
import { render } from 'react-dom';
import CustomElement from './custom-element';

render(<CustomElement tbody={<tbody />} />);
```

Currently we support virtual nodes from the following libraries:

- React