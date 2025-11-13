import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { combineReducers } from "@reduxjs/toolkit"

// Importar slices
import authReducer from "./features/authSlice"
import cartReducer from "./features/cartSlice"
import wishlistReducer from "./features/wishlistSlice"
import categoryReducer from "./features/CategorySlice"
import productReducer from "./features/productSlice"
import discountReducer from "./features/discountSlice"
import paymentMethodReducer from "./features/paymentMethodSlice"
import deliveryTypeReducer from "./features/deliveryTypeSlice"
import orderReducer from "./features/orderSlice"

// Configuración de persist
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth"], // Solo persistir auth (token y user)
}

// Combinar reducers
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  categories: categoryReducer,
  products: productReducer,
  discounts: discountReducer,
  paymentMethods: paymentMethodReducer,
  deliveryTypes: deliveryTypeReducer,
  orders: orderReducer,
})

// Crear reducer persistido
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configurar store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// Crear persistor
export const persistor = persistStore(store)
