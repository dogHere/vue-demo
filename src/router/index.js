import Vue from 'vue'
import Router from 'vue-router'
import GraphTable from '../components/pages/GraphTable'
import GraphTable2 from '../components/pages/GraphTable2'
import GraphTask from '../components/pages/GraphTask'
import GraphField from '../components/pages/GraphField'


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
    // {
    //   path: '/graph-table',
    //   name: 'graph-table',
    //   component: GraphTable
    // },
    {
      path: '/graph-table2',
      name: 'graph-table2',
      component: GraphTable2
    },
    {
      path: '/',
      name: 'graph-table2',
      component: GraphTable2
    },
    {
      path: '/graph-task',
      name: 'graph-task',
      component: GraphTask
    },
    {
      path: '/graph-field',
      name: 'graph-field',
      component: GraphField
    },
    {
      path: '/graph-keypath-diff',
      name: 'graph-keypath-diff',
      // redirect:'/internal/dg/findwhyslow/index/index_keypath_diff.html',
      beforeEnter(to, from, next) {
        // Put the full page url including the protocol http(s) below
        window.location = "/internal/dg/findwhyslow/index/index_keypath_diff.html"
      }
    },
  ]
})
