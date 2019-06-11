import Vue from 'vue'
import Router from 'vue-router'
import GraphTable from '../components/pages/GraphTable'
import Graph from '../components/pages/Graph'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/graph-rerun',
      name: 'graph-rerun',
      component: Graph
    }
    ,
    {
      path: '/',
      name: 'graph-rerun',
      component: Graph
    }
    ,
    {
      path: '/graph-table',
      name: 'table',
      component: GraphTable
    }
  ]
})
