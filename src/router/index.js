import Vue from 'vue'
import Router from 'vue-router'
import Index from '../components/pages/Index'
import Graph from '../components/pages/Graph'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/graph',
      name: 'graph',
      component: Graph
    }
    ,
    {
      path: '/',
      name: 'index',
      component: Index
    }
  ]
})
