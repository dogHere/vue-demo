import Vue from 'vue'
import Router from 'vue-router'
import GraphTable from '../components/pages/GraphTable'
import GraphTableUse from '../components/pages/GraphTableUse'
import GraphView from '../components/pages/GraphView'

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
    // {
    //   path: '/',
    //   name: 'graph-rerun',
    //   component: Graph
    // }
    // ,
    {
      path: '/graph-table',
      name: 'graph-table',
      component: GraphTable
    },
    {
      path: '/graph-table2',
      name: 'graph-table2',
      component: GraphTableUse
    },
    {
      path: '/graph-view',
      name: 'graph-view',
      component: GraphView
    },
    // {
    //   path: '/graph-task',
    //   name: 'graph-task',
    //   component: GraphTask
    // },
  ]
})
