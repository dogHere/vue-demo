<template>
  <div id="root">
    <layout page-header="Task级别血缘-可视化"
            active-item="graph-task">
        <GraphView
           ref="GraphView" 
           :showUpstreamAPI="showUpstreamAPI"
           :showDownstreamAPI="showDownstreamAPI"
           :showPathAPI="showPathAPI"
           :showKeyPathAPI="showKeyPathAPI"
           :handleStr2Obj="handleStr2Obj"
           :handleDescProps="handleDescProps"
           :searchTableData="searchTableData"
           :handle2StdV="handle2StdV"
           :handle2StdE="handle2StdE"
           >
           <template slot="searchTable">
             <div>
               <a-select
                  showSearch
                  :value="searchTableValue"
                  placeholder="input search text"
                  style="width: 1200px"
                  :defaultActiveFirstOption="false"
                  :showArrow="false"
                  :filterOption="false"
                  @search="handleSearchTable"
                  @change="handleChangeTable"
                  :notFoundContent="null"
                >
                  <a-select-option v-for="d in searchTableData" :key="d">{{d}}</a-select-option>
                </a-select>
             </div>
           </template>
           
        </GraphView>
    </layout>
  </div>
</template>

<script>
import Layout from '../common/Layout'
import axiosRequst from '../../util/httpUtils'
import _ from 'lodash'
import GraphView from './GraphView'


export default {
  name: 'graph-task',
  components: {
    Layout,
    GraphView,
  },
  data(){
    return {
        searchTableData:["airflow_dw2@ks_dws-mail_daily_new_report_boss@mail_daily_new_report"],
        searchTableValue:null,
    }
  },

  methods: {
    handle2StdV:(v)=>{
        return v.theKey
    }
    ,handle2StdE:(e)=>{
        return {
            source:e.source.theKey,
            dest:e.dest.theKey
        }
    }
    ,handleChangeTable(value){
      this.searchTableValue = value
      this.handleSearchTable(value)
    }
    ,
    handleSearchTable(value){
      if(value){
        this.searchTableValue = value
        axiosRequst({
                path: '/internal/dg/findwhyslow/graph/task/search',
                params: {
                  pDate:"20190610",
                  task:value
                },
                type:'get'
        }).then(data=>{
            let list = _.get(data,'data.data');
            if(list&&list.length>0){
                this.searchTableData = list;
            }else{
              this.searchTableData=[]
            }
        })
      }
    }
    ,
    showUpstreamAPI:(value)=>{
        return {
          path: '/internal/dg/findwhyslow/graph/task/upstream2',
          params: {
              task:value,
              pDate:"20190610",
          },
          type:'get'
        }
    },
    showDownstreamAPI:(value)=>{
          return {
            path: '/internal/dg/findwhyslow/graph/task/downstream2',
            params: {
                task:value,
                pDate:"20190610",

            },
            type:'get'
          }
          
    },
    showPathAPI:(v1,v2)=>{
          return {
            path: '/internal/dg/findwhyslow/graph/task/path',
            params: {
                task:v1,
                task2:v2,
                pDate:"20190610",
                
            } ,
            type:'get'
          }
          
    },
    showKeyPathAPI:(v,keyPathOnly)=>{
        return {
          path: '/internal/dg/findwhyslow/graph/task/keypath2',
          params: {
              task:v,
              keyPathOnly,
              pDate:"20190610",
              
          },
          type:'get'
        }
    },
    handleStr2Obj:(v)=>{
        if(!v){
            return {}
        }else{
            let arr=v.split("@")
            return {
                clusterId:arr[0],
                dagId:arr[1],
                taskId:arr[1]
            }
        }
    },
    handleDescProps:(prop)=>{
        return {
          "clusterId":prop["clusterId"],
          "dagId":prop["dagId"],
          "taskId":prop["taskId"],
          "keyPath":prop["keyPath"],
         
        }
    },
  },
}

</script>
