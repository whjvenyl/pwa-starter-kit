/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';

// These are the elements needed by this element.
import './shop-products.js';
import './shop-cart.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';
import { ButtonSharedStyles } from './button-shared-styles.js';

class MyView3 extends PageViewElement {
  _render({_cart, _products, _error}) {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      <style>
        /* Add more specificity (.checkout) to workaround an issue in lit-element:
           https://github.com/PolymerLabs/lit-element/issues/34 */
        button.checkout {
          border: 2px solid var(--app-dark-text-color);
          border-radius: 3px;
          padding: 8px 16px;
        }
        button.checkout:hover {
          border-color: var(--app-primary-color);
          color: var(--app-primary-color);
        }
      </style>

      <section>
        <h2>Redux example: shopping cart</h2>
        <div class="circle">${this._numItemsInCart(_cart)}</div>

        <p>This is a slightly more advanced example, that simulates a
          shopping cart: getting the products, adding/removing items to the
          cart, and a checkout action, that can sometimes randomly fail (to
          simulate where you would add failure handling). </p>
        <p>This view, passes properties down to its two children, <code>&lt;shop-products&gt;</code> and
        <code>&lt;shop-cart&gt;</code>, which fire events back up whenever
        they need to communicate changes.</p>
      </section>
      <section>
        <h3>Products</h3>
        <shop-products products="${_products}"></shop-products>

        <br>
        <h3>Your Cart</h3>
        <shop-cart products="${_products}" cart="${_cart}"></shop-cart>

        <div>${_error}</div>
        <br>
        <p>
          <button class="checkout" hidden="${_cart.addedIds.length == 0}"
              on-click="${() => this.checkout()}">
            Checkout
          </button>
        </p>
      </section>
    `;
  }

  static get properties() { return {
    // This is the data from the store.
    _cart: Object,
    _products: Object,
    _error: String
  }}

  constructor() {
    super();
    this._cart = {addedIds: [], quantityById: {}};
    this._error = '';
  }

  ready() {
    this._products = this._getAllProducts();
    super.ready();

    this.addEventListener('addToCart', (e) => this._addToCart(e.detail.item));
    this.addEventListener('removeFromCart', (e) => this._removeFromCart(e.detail.item));
  }

  checkout() {
    // Here you could do things like credit card validation, etc.
    // We're simulating that by flipping a coin :)
    const flip = Math.floor(Math.random() * 2);
    if (flip === 0) {
      this._error = 'Checkout failed. Please try again';
    } else {
      this._error = '';
      this._cart = {addedIds: [], quantityById: {}};
    }
  }

  _addToCart(productId) {
    this._error = '';
    if (this._products[productId].inventory > 0) {
      this._products[productId].inventory--;

      if (this._cart.addedIds.indexOf(productId) !== -1) {
        this._cart.quantityById[productId]++;
      } else {
        this._cart.addedIds.push(productId);
        this._cart.quantityById[productId] = 1;
      }
    }

    // TODO: this should be this.invalidate
    this._products = JSON.parse(JSON.stringify(this._products));
    this._cart = JSON.parse(JSON.stringify(this._cart));
  }

  _removeFromCart(productId) {
    this._error = '';
    this._products[productId].inventory++;

    const quantity = this._cart.quantityById[productId];
    if (quantity === 1) {
      this._cart.quantityById[productId] = 0;
      // This removes all items in this array equal to productId.
      this._cart.addedIds = this._cart.addedIds.filter(e => e !== productId);
    } else{
      this._cart.quantityById[productId]--;
    }

    // TODO: this should be this.invalidate
    this._products = JSON.parse(JSON.stringify(this._products));
    this._cart = JSON.parse(JSON.stringify(this._cart));
  }

  _numItemsInCart(cart) {
    let num = 0;
    for (let id of cart.addedIds) {
      num += cart.quantityById[id];
    }
    return num;
  }

  _getAllProducts() {
    // Here you would normally get the data from the server.
    const PRODUCT_LIST = [
      {"id": 1, "title": "Cabot Creamery Extra Sharp Cheddar Cheese", "price": 10.99, "inventory": 2},
      {"id": 2, "title": "Cowgirl Creamery Mt. Tam Cheese", "price": 29.99, "inventory": 10},
      {"id": 3, "title": "Tillamook Medium Cheddar Cheese", "price": 8.99, "inventory": 5},
      {"id": 4, "title": "Point Reyes Bay Blue Cheese", "price": 24.99, "inventory": 7},
      {"id": 5, "title": "Shepherd's Halloumi Cheese", "price": 11.99, "inventory": 3}
    ];

    // You could reformat the data in the right format as well:
    const products = PRODUCT_LIST.reduce((obj, product) => {
      obj[product.id] = product
      return obj
    }, {});
    return products;
  };
}

window.customElements.define('my-view3', MyView3);
