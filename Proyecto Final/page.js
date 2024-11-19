const store = new Vuex.Store({
    state: {
        products: [
            { id: 1, name: 'Control PS5', price: 300000, description: 'Control inalámbrico DualSense con retroalimentación háptica y gatillos adaptativos.', image: './image/descarga(1).jpg' },
            { id: 2, name: 'Control PS4', price: 250000, description: 'Control DualShock 4 con barra de luz y precisión mejorada.', image: './image/descarga.jpg' },
            { id: 3, name: 'Control Xbox Series X', price: 320000, description: 'Control inalámbrico de Xbox con texturas antideslizantes y mapeo personalizado.', image: './image/descarga(2).jpg' },
            { id: 4, name: 'Control Xbox One', price: 270000, description: 'Control inalámbrico de Xbox One con diseño ergonómico y conexión Bluetooth.', image: './image/descarga(3).jpg' }
        ],
        cart: [],
        user: {
            name: '',
            email: '',
            preferences: [] // Evita que sea null
        },
        orderHistory: [] // Inicializa como array vacío
    },
    mutations: {
        addToCart(state, product) {
            const found = state.cart.find(item => item.id === product.id);
            if (found) {
                found.quantity++;
            } else {
                state.cart.push({ ...product, quantity: 1 });
            }
        },
        removeFromCart(state, productId) {
            const found = state.cart.find(item => item.id === productId);
            if (found) {
                found.quantity--;
                if (found.quantity <= 0) {
                    state.cart = state.cart.filter(item => item.id !== productId);
                }
            }
        },
        clearCart(state) {
            state.cart = [];
        },
        updateUser(state, userData) {
            console.log('Actualizando usuario:', userData); // Log para depurar
            state.user = { ...state.user, ...userData };
        },
        addOrder(state, order) {
            console.log('Agregando pedido:', order); // Log para depurar
            state.orderHistory.push(order);
        }
        
    },
    getters: {
        cartTotal(state) {
            return state.cart.reduce((total, product) => total + product.price * product.quantity, 0);
        },
        cartItems(state) {
            return state.cart;
        },
        productsList(state) {
            return state.products;
        },
        userData(state) {
            return state.user;
        },
        orderHistory(state) {
            return state.orderHistory;
        }
    }
});

const UserProfile = {
    template: `
    <div>
        <h2>Perfil de Usuario</h2>
        <form @submit.prevent="updateProfile">
            <div>
                <label for="name">Nombre:</label>
                <input type="text" v-model="user.name" id="name" required>
            </div>
            <div>
                <label for="email">Correo Electrónico:</label>
                <input type="email" v-model="user.email" id="email" required>
            </div>
            <div>
                <label for="preferences">Preferencias (categorías favoritas):</label>
                <input type="text" v-model="preferencesInput" id="preferences" placeholder="Ej. PS5, Xbox">
                <button type="button" @click="addPreference">Agregar</button>
            </div>
            <ul>
                <li v-for="(pref, index) in user.preferences" :key="index">
                    {{ pref }} <button @click="removePreference(index)">Eliminar</button>
                </li>
            </ul>
            <button type="submit">Actualizar Perfil</button>
        </form>

        <h3>Historial de Pedidos</h3>
        <ul v-if="orderHistory.length > 0">
            <li v-for="(order, index) in orderHistory" :key="index">
                Pedido {{ index + 1 }} - Total: {{ order.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}
                <ul>
                    <li v-for="item in order.items" :key="item.id">
                        {{ item.name }} (x{{ item.quantity }})
                    </li>
                </ul>
            </li>
        </ul>
        <p v-else>No tienes pedidos registrados.</p>
    </div>
    `,
    computed: {
        user() {
            return this.$store.getters.userData;
        },
        orderHistory() {
            return this.$store.getters.orderHistory;
        }
    },
    data() {
        return {
            preferencesInput: ''
        };
    },
    methods: {
        updateProfile() {
            this.$store.commit('updateUser', { name: this.user.name, email: this.user.email });
            alert('Perfil actualizado.');
        },
        addPreference() {
            if (this.preferencesInput.trim()) {
                this.$store.commit('updateUser', { preferences: [...this.user.preferences, this.preferencesInput.trim()] });
                this.preferencesInput = '';
            }
        },
        removePreference(index) {
            const updatedPreferences = [...this.user.preferences];
            updatedPreferences.splice(index, 1);
            this.$store.commit('updateUser', { preferences: updatedPreferences });
        }
    }
};


const Home = {
    template: `
    <div>
        <h1>Tienda de Controles</h1>
        <div class="product-list">
            <div v-for="product in productsList" :key="product.id" class="product">
                <img :src="product.image" alt="Imagen de {{ product.name }}" class="product-image">
                <h3>{{ product.name }}</h3>
                <p class="price">{{ product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</p>
                <p class="details">{{ product.description }}</p>
                <button class="buy-button" @click="addToCart(product)">Agregar al carrito</button>
            </div>
        </div>
    </div>
    `,
    computed: {
        productsList() {
            return this.$store.getters.productsList;
        }
    },
    methods: {
        addToCart(product) {
            this.$store.commit('addToCart', product);
        }
    }
};

const Cart = {
    template: `
    <div>
        <h2>Carrito de Compras</h2>
        <div v-if="cartItems.length > 0">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
                <p>{{ item.name }} - {{ item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }} x {{ item.quantity }}</p>
                <p>Total: {{ (item.price * item.quantity).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</p>
                <button @click="removeFromCart(item.id)">Eliminar uno</button>
            </div>
            <h3>Total del carrito: {{ cartTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</h3>
            <router-link to="/checkout"><button class="checkout-button">Proceder al Pago</button></router-link>
        </div>
        <div v-else>
            <p>El carrito está vacío</p>
        </div>
    </div>
    `,
    computed: {
        cartItems() {
            return this.$store.getters.cartItems;
        },
        cartTotal() {
            return this.$store.getters.cartTotal;
        }
    },
    methods: {
        removeFromCart(productId) {
            this.$store.commit('removeFromCart', productId);
        }
    }
};

const Checkout = {
    template: `
    <div>
        <h2>Formulario de Pago</h2>
        <form @submit.prevent="processPayment">
            <div>
                <label for="cardName">Nombre en la tarjeta:</label>
                <input type="text" v-model="cardName" id="cardName" required>
            </div>
            <div>
                <label for="cardNumber">Número de tarjeta:</label>
                <input type="text" v-model="cardNumber" id="cardNumber" maxlength="16" required>
            </div>
            <div>
                <label for="expirationDate">Fecha de expiración:</label>
                <input type="month" v-model="expirationDate" id="expirationDate" required>
            </div>
            <div>
                <label for="cvv">CVV:</label>
                <input type="text" v-model="cvv" id="cvv" maxlength="3" required>
            </div>
            <h3>Total: {{ cartTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) }}</h3>
            <button type="submit">Pagar</button>
        </form>
    </div>
    `,
    data() {
        return {
            cardName: '',
            cardNumber: '',
            expirationDate: '',
            cvv: ''
        };
    },
    computed: {
        cartTotal() {
            return this.$store.getters.cartTotal;
        }
    },
    methods: {
        processPayment() {
            if (this.cardName && this.cardNumber && this.expirationDate && this.cvv) {
                const order = {
                    items: this.$store.state.cart,
                    total: this.cartTotal,
                    date: new Date().toLocaleDateString()
                };
                this.$store.commit('addOrder', order); // Agregar al historial
                this.$store.commit('clearCart');
                alert('Pago realizado con éxito. ¡Gracias por tu compra!');
                this.$router.push('/');
            } else {
                alert('Por favor, completa todos los campos correctamente.');
            }
        }
    }
};

const router = new VueRouter({
    routes: [
        { path: '/', component: Home },
        { path: '/cart', component: Cart },
        { path: '/checkout', component: Checkout },
        { path: '/profile', component: UserProfile }
    ]
});

new Vue({
    el: '#app',
    store,
    router,
    template: `
    <div>
        <nav>
          <ul>
            <li><router-link to="/">Tienda</router-link></li>
            <li><router-link to="/cart">Carrito ({{ cartCount }})</router-link></li>
            <li><router-link to="/profile">Perfil</router-link></li>
          </ul>
        </nav>
        <router-view></router-view>
    </div>
    `,
    computed: {
        cartCount() {
            return this.$store.getters.cartItems.reduce((total, item) => total + item.quantity, 0);
        }
    }
});
