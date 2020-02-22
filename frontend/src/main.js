// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import instascan from 'Instascan'
import { store } from '../src/store'
import 'expose-loader?$!expose-loader?jQuery!jquery'
import 'bootstrap'
import './assets/bootstrap/bootstrap.css'

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$scan = instascan

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
