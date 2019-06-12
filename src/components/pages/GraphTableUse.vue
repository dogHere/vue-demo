<template>
  <div id="root">

        <GraphView ref="GraphView">
        </GraphView>
  </div>
</template>

<script>
import Layout from '../common/Layout'
import axiosRequst from '../../util/httpUtils'
import _ from 'lodash'
import GraphView from './GraphView'


export default {
  name: 'graph-table2',
  components: {
    Layout,
    GraphView,
  },
  data(){
    return {
        
    }
  },
  methods: {
    
  },
}
