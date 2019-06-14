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
          <template slot="moreButton">
            <div style="margin-right:10px;">
                <a-popover
                      title="配置"
                      trigger="click"
                      placement="bottomLeft"
                    >
                        <a-button class="buttonItem"  type="primary"  > 配置 </a-button>
                        <template slot="content">
                          <div>
                             <div style="padding-bottom:10px">
                               <font color="red">pDate,格式yyyyMMdd</font>
                             </div>
                              <div style="padding-bottom:10px">
                                <a-input placeholder="pDate,格式yyyyMMdd" @change="pDateHandle" :value="pDate===null?defaultPate():pDate"> </a-input>
                             </div>
                          </div>
                        </template>
                    
               </a-popover>
            </div>
          </template>


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


Date.prototype.format = function(fmt) { 
     var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt; 
} 


function theDefaultPate(){
  let date = new Date();
          date.setDate(date.getDate() - 1)
   return date.format("yyyyMMdd")
}

let pDateGlobal = theDefaultPate()

function handleUnixTime(time){
  if(!time)
      return "-"; 
  return new Date(time).format("yyyy-MM-dd hh:mm:ss")
}
function handleNas(t){
  if(!t){
    return "-"
  }
  return Math.round(t/60*100)/100+"分钟"
}

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
        clusters:["airflow_dw2","airflow_abtest","airflow_global","airflow_idp1","airflow_global_prod","airflow_ods","airflow_privacy"],
        searchClusterValue:null,
        pDate:pDateGlobal,
    }
  },

  methods: {

    pDateHandle(value){
      if(value){
        this.pDate=value.target.value.trim()
        pDateGlobal = this.pDate;
      }
    }
    ,

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
                  pDate:pDateGlobal,
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
                  pDate:pDateGlobal,
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
            pDate:pDateGlobal,
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
              pDate:pDateGlobal,
          },
          type:'get'
        }
    },
    showDownstreamAPI:(value)=>{
          return {
            path: '/internal/dg/findwhyslow/graph/task/downstream2',
            params: {
                task:value,
                pDate:pDateGlobal,

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
                pDate:pDateGlobal,
                
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
              pDate:pDateGlobal,
              
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
          "关键路径":prop["keyPath"],
          "executionDate":handleUnixTime(prop["executionDate"]),
          "开始时间":handleUnixTime(prop["startDate"]),
          "结束时间":handleUnixTime(prop["endDate"]),
          "执行时长":handleNas(prop["duration"]),
          "状态":prop["state"],
          "tryNumber":prop["tryNumber"],
          "operator":prop["operator"]

        }
    },

  },
}

</script>
