Readapt
==================

Readapt is based off of Preact JS, with two major modifications: 

* Full ES6 class based
* MVVM instead of State based

When release version is gzipped it is roughly 2.5KB.

It supports JSX and Server Side Rendering just like Preact and React. There is one small difference, and that is the fact that the hydration for client side is like React, rather than Preact.

Using JSX
================
You can use the base React JSX with babel and it will just work. Or, you can define that JSX uses h like Preact.

Further Differences vs. React and Preact
=======================

* DOM Events for elements do not use the React or Preact version of special names for events. Instead, event names are the standard JavaScript API for DOM. The only thing you have to do is add on in front: oninput, onclick, onkeypress, etc.
* It uses Preact version of references, rather than Reacts
* Does not have portals, yet.
* Does not work with Redux (No states as MVVM instead. I highly recommend using a central EventEmitter system).
* Does not have Context, yet.
* Does not have Fragments, yet.

Some examples of the Events
----------------------------
```
//JSX
<MyComponent onclick={this.onClick} />

//or raw Preact way

h(MyComponent, {onclick: this.onClick});

//or raw React Way

React.createElement(MyComponent, {onclick: this.onClick});
```

Some reference examples
------------------------

```
//JSX
<div ref={f => this.mydiv = f} />

//or raw Preact way

h('div', {ref: f => this.mydiv = f});

//or raw React way

React.createElement('div', {ref: f => this.mydiv = f});
```

Other than those, most other things are the same.


Defining a Component
===========================

To define a component, you will extend the Component Class
```
class MyView extends Component {

    //o is the incoming properties
    //when properties are applied they are converted
    //to MVVM fields
    //parent is the parent component if there is one
    constructor(o, parent) {
        super(o, parent);   

        //defining custom MVVM fields
        //be careful not to overwrite 
        //any incoming expected properties
        this.observe({
            messages: [],
            isReady: false
        });
    }

    //By default shouldComponentUpdate always
    //returns true
    //the key is the MVVM field that triggered
    //the update
    //the value is the new incoming value
    //previous is the previous value of that field
    // returning false will prevent from rendering
    shouldComponentUpdate(key, value, previous) {
        return true;
    }

    async getMessages() {
        const items = await ...;
        
        //this assignment will cause
        //a render
        this.messages = items;
    }

    // this is fired after the first render only
    componentDidMount() {
        //the component mounted
        //do whatever you want here
        //eg css class animation etc

        //oh get something from a service
        this.getMessages();
    }

    //previous is an object
    //with all the previous properties
    //and their values before the update
    componentDidUpdate(previous) {

    }

    //this is fired before the component
    //will be removed
    componentWillUnmount() {
        //do whatever you want here
        //eg css class animation etc
    }

    // you should never, ever modify a 
    // property in the render function
    // as the render function should just
    // return JSX or h() or React.createElement()
    // you can return null
    // you can not return arrays
    render() {
        return h(MyListView, {messages: this.messages, isReady: this.isReady});
    }
}
```

Disabling Auto Rendering of a Component
==========================
This is for if you need to update any of the MVVM fields without causing a render

This comes in handy if you want to reset but not render, while you wait for data
from a server or something.

```
this.disabled = true;

//this will not trigger a render now
//but the value is still updated
this.messages = [];

this.disabled = false;
```

Forcing a Re-Render of a Component
=================
```
this.forceUpdate();
```


Rendering a Component to DOM
==========================
```
Readapt.render(h(MyComponent, {...}), document.getElementById('main'));
```

Hydrating Server Side Rendered
==============================
```
Readapt.hydrate(h(MyComponent, {...}), document.getElementById('main'));
```

LICENSE
==========
MIT