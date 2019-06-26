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
           :handleDescPropsE="handleDescPropsE"
           :searchTableData="searchTableData"
           :handle2StdV="handle2StdV"
           :handle2StdE="handle2StdE"
           :searchTableValue="searchTableValue"
           :addOtherListen="addOtherListen"
           :searchGroups="searchGroups"
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

                                <a-select
                                  mode="tags"
                                  style="width: 100%"
                                  @change="pDateHandle"
                                  placeholder="pDate"
                                  :value="pDate===null?defaultPate():pDate"
                                >
                                    <a-select-option v-for="i in days" :key="i" >{{i}}</a-select-option>
                                </a-select>

                                <!--
                                 <a-input placeholder="pDate,格式yyyyMMdd" @change="pDateHandle" :value="pDate===null?defaultPate():pDate"> </a-input>
                                -->
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
                  :value="searchDagValue==null?'':toDag(searchDagValue)"
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

let pDateGlobal = [theDefaultPate()]

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

function handleMi(t){
  if(!t){
    return "-"
  }
  return Math.round(t/60/1000*100)/100+"分钟"
}

function createDays(){
  let date = new Date();
  let days = [];
  for(let i=0;i<100;i++){
    let date2 = new Date();
    date2.setDate((date.getDate() - i))
    days.push(date2.format("yyyyMMdd"))
  }
  return days;

}


let days =  createDays()


function takeMax(days){
  if(!days){
    return ""
  }
  let res =  Math.max(... days)
  return res;
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
        clusters:["airflow_dw2","airflow_abtest","airflow_global","airflow_idp1","airflow_global_prod","airflow_ods","airflow_privacy"],
        searchClusterValue:null,
        pDate:pDateGlobal,
        searchDagPending:false,
        days:days,
        searchGroups:pDateGlobal,
    }
  },

  methods: {

    pDateHandle(value){
      console.log("reset pDate value",value)
      let changed=false 
      if(value){
        if(value.length>3){
          this.$message.info("pDate 限填3个")
          return 
        }
        if(this.pDate){
            if(! _.isEqual(this.pDate.sort(), value.sort())){
               changed = true 
            }
        }else{
            changed = true;
        }
       
        console.log(value)
        this.pDate=value;
        pDateGlobal = this.pDate;
      }
      console.log("pDateHandle changed",changed)
      if(changed){
        this.searchGroups =value
        console.log("reset pDate  this.searchGroups",this.searchGroups )
        this.$refs.GraphView.reset()
        
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
        return {str:v.theKey}
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
        this.searchTableValue = null

        this.handleSearchDag(this.searchDagValue ,true,()=>{
          this.handleSearchTable(this.searchDagValue)
        })
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
                  pDate:takeMax(pDateGlobal),
                  task:value
                },
                type:'get'
        }).then(data=>{
            console.log(data," search data")
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
    handleSearchDag(tvalue,origin,thenDo){
      let value ;
      if(origin){
          value = tvalue
      }else{
         value = this.searchClusterValue+"@"+tvalue
      }
      // todo
      if(value){
        this.searchDagValue = value
        this.searchDagPending = true

        axiosRequst({
                path: '/internal/dg/findwhyslow/graph/dag/search',
                params: {
                  pDate:takeMax(pDateGlobal),
                  dag:value
                },
                type:'get'
        }).then(data=>{
            this.searchDagPending=false
            let list = _.get(data,'data.data');
            if(list&&list.length>0){
                this.searchDagData = list;
            }else{
              this.searchDagData=[]
            }
            if(thenDo){
              thenDo()
            }else{
              
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
      return pDateGlobal.map(p=>{
       return {
          path: '/internal/dg/findwhyslow/graph/task/upstream2',
          params: {
              task:value,
              pDate:p,
          },
          type:'get',
          groupId:p,
        }
      })
    },
    showDownstreamAPI:(value)=>{
      return  pDateGlobal.map(p=>{
          return {
            path: '/internal/dg/findwhyslow/graph/task/downstream2',
            params: {
                task:value,
                pDate:p,

            },
            type:'get'
            ,groupId:p
          }
      })    
    },
    showPathAPI:(v1,v2)=>{
      return pDateGlobal.map(p=>{
         return {
            path: '/internal/dg/findwhyslow/graph/task/path',
            params: {
                task:v1,
                task2:v2,
                pDate:p,
                
            } ,
            type:'get',
            groupId:p
          }
      })  
    },
    showKeyPathAPI:(v,keyPathOnly)=>{
        return pDateGlobal.map(p=>{
          console.log("showkeypathArgs --> ",p)
          return {
            path: '/internal/dg/findwhyslow/graph/task/keypath2',
            params: {
                task:v,
                keyPathOnly,
                pDate:p,
                
            },
            type:'get',
            groupId:p,
          }
        })
        
    },
    handleStr2Obj:(v)=>{
        if(!v){
            return {}
        }else{
            console.log("handleStr2Obj",v);
            let arr=v.str.split("@")
            return {
                clusterId:arr[0],
                dagId:arr[1],
                taskId:arr[2],
                pDate:v.groupId,
            }
        }
    },

    

    handleDescProps:(props)=>{
        let res = {}
        Object.keys(props).forEach(group=>{
            let prop = props[group]
            res[group] = {
              "clusterId":prop["clusterId"],
              "dagId":prop["dagId"],
              "taskId":prop["taskId"],
              "关键路径":prop["keyPath"],
              "运行方式":prop["runType"],
              "executionDate":handleUnixTime(prop["executionDate"]),
              "开始时间":handleUnixTime(prop["startDate"]),
              "结束时间":handleUnixTime(prop["endDate"]),
              "执行时长":handleNas(prop["duration"]),
              "状态":prop["state"],
              "tryNumber":prop["tryNumber"],
              "operator":prop["operator"],

              "query数":prop["queryCnt"],
              "query实际运行":handleMi(prop["queryRealCost"]),
              "query提交时长":handleMi(prop["queryInterval"]),
              "query Pending":handleMi(prop["queryPending"]),
              "query数据倾斜":handleMi(prop["queryOptimize"]),
              "query理论运行时长":handleMi(prop["queryEmsCost"]),
              "pDate":group
            }
        })
        return res;
    },
      handleDescPropsE:(props)=>{
          let res = {}
          Object.keys(props).forEach(group=>{
              let prop = props[group]
              res[group] = {
                "上游ClusterId":prop["up_clusterId"],
                "上游DagId":prop["up_dagId"],
                "上游TaskId":prop["up_taskId"],
                "下游ClusterId":prop["down_clusterId"],
                "下游DagId":prop["down_dagId"],
                "下游TaskId":prop["down_taskId"],
                "pDate":prop["pDate"],
                "调度间隔":handleMi(prop["interval"]),
              }
          })
          return res;
    },

  },
}

</script>
