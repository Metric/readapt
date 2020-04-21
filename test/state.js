'use strict';

class ProductCategoryRow extends Component {
    constructor(o, parent, renderMode) {
        super(o, parent, renderMode);
    }

    async render() {
        const category = this.category;
        return h('tr', {}, 
            h('th', {colspan:"2"}, category));
    }
}

class ProductRow extends Component {
    constructor(o, parent, renderMode) {
        super(o, parent, renderMode);
    }

    async render() {
        const product = this.product;
        const name = product.stocked ? product.name : h('span', {style: {
            color: 'red'   
        }}, product.name);

        return h('tr', {},
            h('td', {}, name),
            h('td', {}, product.price));
    }
}

class TableHeader extends Component {
    constructor(o, parent, renderMode) {
        super(o, parent, renderMode);
    }

    async render() {
        return h('thead', {} ,
            h('tr', {}, 
                h('td', {}, 'Name'), 
                h('td', {}, 'Price')));
    }
}

class ProductTable extends Component {
    constructor(o, parent, renderMode) {
        super(o, parent, renderMode);
    }

    async render() {
        const filterText = this.filterText;
        const inStockOnly = this.inStockOnly;

        const rows = [];
        let lastCategory = null;

        this.products.forEach((product) => {
            if(filterText && product.name.toLowerCase().indexOf(filterText.toLowerCase()) === -1) {
                return;
            }

            if(inStockOnly && !product.stocked) {
                return;
            }
            if(product.category !== lastCategory) {
                rows.push(
                    h(ProductCategoryRow, {category: product.category})
                );
                lastCategory = product.category;
            }
            rows.push(
                h(ProductRow, {product: product})
            );
        });

        return h('table', {}, 
            h(TableHeader, {}),
            h('tbody', {}, rows)
        );
    }
}

class SearchBar extends Component {
    constructor(o, parent, renderMode) {
        super(o, parent, renderMode);

        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
        this.handleInStockChange = this.handleInStockChange.bind(this);
    }

    handleFilterTextChange(e) {
        if(this.onFilterTextChange) {
            this.onFilterTextChange(e.target.value);
        }
    }

    handleInStockChange(e) {
        if(this.onInStockChange) {
            this.onInStockChange(e.target.checked);
        }
    }

    async render() {
        const filterText = this.filterText;
        const inStockOnly = this.inStockOnly;

        return h('form', {},
            h('input', {type: 'text', oninput: this.handleFilterTextChange, placeholder: 'search...', value: filterText}),
            h('label', {onclick: this.handleInStockChange}, 
                h('input', {type: 'checkbox', checked: inStockOnly}),
                'Only show products in stock'
            ),
            this.children
        );
    }
}

class FilterableProductTable extends Component {
    constructor(o, parent, renderMode) {
        super(o, parent, renderMode);

        this.renderMode = 3;
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
        this.handleInStockChange = this.handleInStockChange.bind(this);
        this.state = {filterText: '', inStockOnly: false};
    }

    handleFilterTextChange(filterText) {
        this.setState({filterText: filterText})
        //this.filterText = filterText;
    }

    handleInStockChange(inStockOnly) {
        this.setState({inStockOnly: inStockOnly});
        //this.inStockOnly = inStockOnly;
    }

    async render() {
        return h(SearchBar, {filterText: this.state.filterText, inStockOnly: this.state.inStockOnly, onInStockChange: this.handleInStockChange, onFilterTextChange: this.handleFilterTextChange }, 
            h(ProductTable, {products: this.products, filterText: this.state.filterText, inStockOnly: this.state.inStockOnly})
        );
    }
}

const products = [
    {category: 'Sporting Goods', price: '$49.99', stocked: true, name: 'Football'},
    {category: 'Sporting Goods', price: '$9.99', stocked: true, name: 'Baseball'},
    {category: 'Sporting Goods', price: '$29.99', stocked: false, name: 'Basketball'},
    {category: 'Electronics', price: '$99.99', stocked: true, name: 'iPod Touch'},
    {category: 'Electronics', price: '$399.99', stocked: false, name: 'iPhone 5'},
    {category: 'Electronics', price: '$199.99', stocked: true, name: 'Nexus 7'}
];


const start = Date.now();
document.querySelectorAll('.app')
    .forEach((e) => {
        Readapt.hydrate(
            h(FilterableProductTable, {products: products}), 
            e);
    });
console.log('start: ' + (Date.now() - start));
