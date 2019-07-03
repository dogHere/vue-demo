import Vue from 'vue'
import Router from 'vue-router'
import GraphTable from '../components/pages/GraphTable'
import GraphTable2 from '../components/pages/GraphTable2'
import GraphTask from '../components/pages/GraphTask'
import GraphField from '../components/pages/GraphField'

import TransformSql from '../components/pages/TransformSql'
import RerunTaskTicket from '../components/pages/RerunTaskTicket'
import RerunTaskStatus from '../components/pages/RerunTaskStatus'


import Graph from '../components/pages/Graph'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/graph-rerun/:jobId',
      name: 'graph-rerun',
      component: Graph
    }
    ,
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
      path: '/transform-sql',
      name: 'transform-sql',
      component: GraphField
    },
    {
      path:'/rerun-task-ticket',
      name: 'rerun-task-ticket',
      component: RerunTaskTicket,
    }
    ,
    {
      path:'/rerun-task-status',
      name: 'rerun-task-status',
      component: RerunTaskStatus,
    }
    ,
    {
      path:'/rerun-task-status/:jobId',
      name: 'rerun-task-status',
      component: RerunTaskStatus,
    }
    
    ,

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
