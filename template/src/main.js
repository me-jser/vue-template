// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
{{#router}}
import router from './router'
{{/router}}
{{#store}}
import {
  createStore
} from './store/index'
{{/store}}
{{#elementUI}}
import {
  Message,
  Loading,
  Table,
  TableColumn,
  Input,
  Button,
  Select,
  Option
} from 'element-ui'
{{/elementUI}}
{{#axios}}
import http from './api/apiList'
{{/axios}}
{{#elementUI}}
/**
 * 按需加载element-ui
 * @module vue/baseConfig
 * @config
 */

Vue.use(Loading.directive)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Input)
Vue.use(Button)
Vue.use(Select)
Vue.use(Option)
Vue.prototype.$loading = Loading.service
Vue.prototype.$message = Message
{{/elementUI}}
{{#axios}}
Vue.prototype.$http = http
{{/axios}}
Vue.config.productionTip = false
{{#store}}
const store = createStore()
{{/store}}
/* eslint-disable no-new */
new Vue({
  el: '#app',
  {{#router}}
  router,
  {{/router}}
  {{#store}}
  store,
  {{/store}}
  components: {
    App
  },
  template: '<App/>'
})
