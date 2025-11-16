import { configureStore } from "@reduxjs/toolkit"


// Importar slices
import authReducer from "./features/authSlice"
import cartReducer from "./features/cartSlice"
import wishlistReducer from "./features/wishlistSlice"
import categoryReducer from "./features/categorySlice"
import productReducer from "./features/productSlice"
import discountReducer from "./features/discountSlice"
import paymentMethodReducer from "./features/paymentMethodSlice"
import deliveryTypeReducer from "./features/deliveryTypeSlice"
import orderReducer from "./features/orderSlice"
import userReducer from "./features/userSlice"

// Configurar store
export const store = configureStore({
  reducer:{
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    categories: categoryReducer,
    products: productReducer,
    discounts: discountReducer,
    paymentMethods: paymentMethodReducer,
    deliveryTypes: deliveryTypeReducer,
    orders: orderReducer,
    user: userReducer,
  } 
})

