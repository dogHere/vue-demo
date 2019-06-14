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
           :searchTableValue="searchTableValue"
           :addOtherListen="addOtherListen"
           :searchTableDefault="searchTableDefault"
           >
           <template slot="searchTable">
             <div>
             clusterId
             <br/>
             <a-select
                  
                  :value="searchClusterValue"
                  placeholder="input search text"
                  style="width: 700px"
                  :defaultActiveFirstOption="false"
                  :showArrow="false"
                  :filterOption="false"
                  @change="handleChangeCluster"
                  :notFoundContent="null"
                >
                  <a-select-option v-for="d in clusters" :key="d">{{d}}</a-select-option>
                </a-select>
                <br/>
                dagId
                 <br/>
             <a-select
                  showSearch
                  :value="searchDagValue"
                  placeholder="input search text"
                  style="width: 700px"
                  :defaultActiveFirstOption="false"
                  :showArrow="false"
                  :filterOption="false"
                  @search="handleSearchDag"
                  @change="handleChangeDag"
                  :notFoundContent="null"
                >
                  <a-select-option v-for="d in searchDagData" :key="d">{{toDag(d)}}</a-select-option>
                </a-select>
                  <br/>
                  taskId 
                   <br/>
               <a-select
                  
                  :value="searchTableValue"
                  placeholder="input search text"
                  style="width: 700px"
                  :defaultActiveFirstOption="false"
                  :showArrow="false"
                  :filterOption="false"
                  @change="handleChangeTable"
                  :notFoundContent="null"
                >
                  <a-select-option v-for="d in searchTableData" :key="d">{{toTask(d)}}</a-select-option>
                </a-select>
             </div>
           </template>
           
        </GraphView>
    </layout>
  </div>
</template>

<script>
import Layout from '../common/Layout'
import {axiosRequst} from '../../util/httpUtils'
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
        searchDagData:[],

        searchDagValue:null,
        
        searchTableValue:null,
        searchTableDefault:"keyPath",
        clusters:["airflow_dw2","airflow_global","airflow_idp1"],
        searchClusterValue:null,
    }
  },

  methods: {
     toTask(d){
      if(d){
        return d.split("@")[2]
      }
    }
    ,
    toDag(d){
      if(d){
        return d.split("@")[1]
      }
    }
    ,
    handle2StdV:(v)=>{
        return v.theKey
    }
    ,handle2StdE:(e)=>{
        return {
            source:e.source.theKey,
            dest:e.dest.theKey
        }
    }
    
    ,
    handleChangeCluster(value){
      this.searchClusterValue = value
      this.searchDagValue = null
      this.searchTableValue = null
      this.searchDagData=[]
      this.searchTableData=[]
    }
    ,

    handleChangeDag(value){
      if(this.searchClusterValue){
        this.searchDagValue = value

        this.handleSearchDag(this.searchDagValue ,true)
        this.handleSearchTable(this.searchDagValue)
        this.searchTableValue = null
      }
    }
    ,handleChangeTable(value){
      this.searchTableValue = value
      
    }
    ,
    handleSearchTable(value){
      if(value){
        // this.searchTableValue = value
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
    handleSearchDag(tvalue,origin){
      let value ;
      if(origin){
          value = tvalue
      }else{
         value = this.searchClusterValue+"@"+tvalue
      }
      // todo
      if(value){
        this.searchDagValue = value
        axiosRequst({
                path: '/internal/dg/findwhyslow/graph/dag/search',
                params: {
                  pDate:"20190610",
                  dag:value
                },
                type:'get'
        }).then(data=>{
            let list = _.get(data,'data.data');
            if(list&&list.length>0){
                this.searchDagData = list;
            }else{
              this.searchDagData=[]
            }
        })
      }
    }
    ,
    addOtherListen(){
       this.$refs.GraphView.getNetwork().on('showPopup',(parms)=>{
          console.log("showPopup",parms)
          // this.handleHotUpdateV(parms)
      })
    },
    requestVReadyTime(v,thenDo){
      axiosRequst({
          path: '/internal/dg/findwhyslow/graph/task/lookup/dagReadyTime',
          params: {
            pDate:"20190610",
            task:v
          },
          type:'get'
      }).then(data=>{
          let readyTime = _.get(data,'data.data');
          if(readyTime&&thenDo){
            thenDo(readyTime)
          }
      })
    }
    ,
    handleHotUpdateV(v){
      if(v){
        this.requestVReadyTime(v,(readyTime)=>{
          this.$refs.GraphView.handleHotUpdateV(v,readyTime)
        })
      }
    },
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
          "executionDate":prop["executionDate"],
          "开始时间":prop["startDate"],
          "结束时间":prop["endDate"],
          "执行时长":prop["duration"],
          "状态":prop["state"],
        }
    },

  },
}

</script>
