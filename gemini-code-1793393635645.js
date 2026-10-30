document.addEventListener('DOMContentLoaded', () => {
    
    // --- ESTADO Y PERSISTENCIA DEL CARRITO VIP ---
    let cart = JSON.parse(localStorage.getItem('cart_heritage_steakhouse')) || [];
    const CONCIERGE_FEE = 12000; // Tarifa de servicio o entrega turística VIP

    const cartCounter = document.getElementById('cart-counter');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutForm = document.getElementById('checkout-form');

    // --- FORMATEADOR PESOS COLOMBIANOS (COP) ---
    const formatCOP = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // --- ACTUALIZAR VISTA DEL CARRITO ---
    const updateCartUI = () => {
        // Guardar estado
        localStorage.setItem('cart_heritage_steakhouse', JSON.stringify(cart));

        // Actualizar contador del menú
        const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (cartCounter) cartCounter.textContent = totalItemsCount;

        if (!cartItemsContainer) return;

        // Comprobar carrito vacío
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-text">Su selección está vacía.<br>Elija una experiencia gastronómica o corte de reserva.</p>';
            if (cartSubtotal) cartSubtotal.textContent = formatCOP(0);
            if (cartShipping) cartShipping.textContent = formatCOP(0);
            if (cartTotal) cartTotal.textContent = formatCOP(0);
            return;
        }

        // Renderizar elementos
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>${formatCOP(item.price)} c/u</span>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="btn-qty btn-minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="btn-qty btn-plus" data-id="${item.id}">+</button>
                    <button type="button" class="btn-remove" data-id="${item.id}" title="Remover">🗑️</button>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });

        const total = subtotal + CONCIERGE_FEE;
        if (cartSubtotal) cartSubtotal.textContent = formatCOP(subtotal);
        if (cartShipping) cartShipping.textContent = formatCOP(CONCIERGE_FEE);
        if (cartTotal) cartTotal.textContent = formatCOP(total);
    };

    // --- EVENT LISTENER PARA AGREGAR PRODUCTOS (DELEGACIÓN) ---
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            const id = addBtn.getAttribute('data-id');
            const name = addBtn.getAttribute('data-name');
            const price = parseInt(addBtn.getAttribute('data-price'), 10);

            const existingIndex = cart.findIndex(item => item.id === id);

            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            updateCartUI();
            
            // Animación de éxito sutil en el botón
            const originalText = addBtn.textContent;
            addBtn.textContent = '¡Añadido a la Orden ✓';
            addBtn.style.backgroundColor = '#1b5e28';
            setTimeout(() => {
                addBtn.textContent = originalText;
                addBtn.style.backgroundColor = '';
            }, 1200);
        }
    });

    // --- CONTROLES DENTRO DEL CARRITO (+, -, ELIMINAR) ---
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (!id) return;

            const itemIndex = cart.findIndex(item => item.id === id);
            if (itemIndex === -1) return;

            if (e.target.classList.contains('btn-plus')) {
                cart[itemIndex].quantity += 1;
            } else if (e.target.classList.contains('btn-minus')) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    cart.splice(itemIndex, 1);
                }
            } else if (e.target.classList.contains('btn-remove')) {
                cart.splice(itemIndex, 1);
            }

            updateCartUI();
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            if (confirm('¿Desea limpiar toda su selección actual?')) {
                cart = [];
                updateCartUI();
            }
        });
    }

    // --- VALIDACIÓN Y ENVÍO DEL CHECKOUT VIP ---
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert('Su carrito está vacío. Por favor seleccione al menos una experiencia culinaria o corte.');
                return;
            }

            const nombre = document.getElementById('nombre').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const direccion = document.getElementById('direccion').value.trim();

            if (!nombre || !telefono || !direccion) {
                alert('Por favor complete todos los campos obligatorios para procesar su reserva.');
                return;
            }

            alert(`Estimado(a) ${nombre}, su reserva y orden VIP han sido registradas con éxito.\nNos comunicaremos al número ${telefono} para confirmar los detalles de entrega en: ${direccion}.\n¡Bienvenido a The Heritage Steakhouse!`);

            // Limpiar estado
            cart = [];
            checkoutForm.reset();
            updateCartUI();
        });
    }

    // Inicialización
    updateCartUI();
});