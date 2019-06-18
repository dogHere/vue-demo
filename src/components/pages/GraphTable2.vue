<template>
  <div id="root">
    <layout page-header="表级别血缘-可视化"
            active-item="graph-table2">
        <GraphView
           ref="GraphView" 
           :showUpstreamAPI="showUpstreamAPI"
           :showDownstreamAPI="showDownstreamAPI"
           :showPathAPI="showPathAPI"
           :showKeyPathAPI="showKeyPathAPI"
           :handleStr2Obj="handleStr2Obj"
           :handleDescProps="handleDescProps"
           :searchTableData="searchTableData"
           :searchTableValue="searchTableValue"
           :handle2StdV="handle2StdV"
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
                                <font color="red" style="panding-top:10px">pDate,格式yyyyMMdd</font>
                             </div>
                              <div style="padding-bottom:10px">
                             注：因数据同步原因，就绪时间日期要比该日期早一天
                             </div>
                            
                              <a-select
                                  mode="tags"
                                  style="width: 100%"
                                  @change="pDateHandle"
                                  placeholder="pDate"
                                  :value="pDate===null?defaultPate():pDate"
                                >
                                    <a-select-option v-for="i in days" :key="i" >{{i}}</a-select-option>
                                </a-select>
                          </div>
                        </template>
                    
               </a-popover>
            </div>
          </template>

           <template slot="searchTable">
             <div>
               输入[库名.表名],或者报表名
               <br/>
               
               <a-select
                  showSearch
                  :value="searchTableValue"
                  placeholder="input search text"
                  style="width: 500px;padding-top: 10px;"
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



function createDays(){
  let date = new Date();
  let days = [];
  for(let i=1;i<100;i++){
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
  name: 'graph-table2',
  components: {
    Layout,
    GraphView,
  },
  data(){
    return {
        searchTableData:["新版核心日报"],
        searchTableValue:null,
        pDate: pDateGlobal,
        days:days,
        searchGroups:pDateGlobal,
    }
  }
  ,

  methods: {
    defaultPate(){
        let date = new Date();
          date.setDate(date.getDate() - 1)
        this.pDate= date.format("yyyyMMdd")
    },
    pDateHandle(value){

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
        this.searchGroups = this.pDate
        this.$refs.GraphView.reset()

      }

    }
    ,
    handleChangeTable(value){
      this.searchTableValue = value
      this.handleSearchTable(value)
    }
    ,
    handleSearchTable(value){
      if(value){
        this.searchTableValue = value
        let arg = {
                path: '/internal/dg/findwhyslow/graph/table/search',
                params: {
                  table:value
                },
                type:'get'
        };
        arg.params['pDate']=takeMax(pDateGlobal);
        axiosRequst(arg).then(data=>{
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
      return pDateGlobal.map(p=>{
        return {
          path: '/internal/dg/findwhyslow/graph/table/upstream2',
          params: {
              table:value,
              pDate:p,
          },
          type:'get',
          groupId:p,
        }
      })
    },
    showDownstreamAPI:(value)=>{
      return pDateGlobal.map(p=>{
          return {
            path: '/internal/dg/findwhyslow/graph/table/downstream2',
            params: {
                table:value,
                pDate:p,
            },
            type:'get',
            groupId:p,
          }
      })  
    },
    showPathAPI:(v1,v2)=>{
      return pDateGlobal.map(p=>{
        return {
            path: '/internal/dg/findwhyslow/graph/table/path',
            params: {
                table:v1,
                table2:v2,
                pDate:p,
                
            } ,
            type:'get',
            groupId:p,
        }
      })
    },
    showKeyPathAPI:(v,keyPathOnly)=>{
      return pDateGlobal.map(p=>{
        return {
          path: '/internal/dg/findwhyslow/graph/table/keypath2',
          params: {
              table:v,
              keyPathOnly, 
              pDate:p             
          },
          type:'get',
          groupId:p
        }
      })

    },
    handleStr2Obj:(v)=>{
        if(!v){
            return {}
        }else{
            let arr=v.str.split(".")
            return {
                dbName:arr[0],
                tbName:arr[1],
                pDate:v.groupId,
            }
        }
    },
    
    handle2StdV:(v)=>{
        return v;
    },

    handleDescProps:(props)=>{
       let res={}
       Object.keys(props).forEach(group=>{
         let prop = props[group]
         res[group]= {
            "库名":prop["dbName"],
            "表名":prop["tbName"],
            "关键路径":prop["keyPath"]===null?"false":prop["keyPath"],
            "就绪时间":prop["readyTime"],  
            "层级":prop["layer"],  
            "clusterId":prop["clusterId"],
            "dagId":prop["dagId"],
            "taskId":prop["taskId"],
            "部门":prop["part"],
            "用户":prop["username"],
            "创建时间":prop["createdTime"],
            "分区数":prop["partitionNums"],
            "最大分区日期":prop["maxPartition"],
            "pDate":group
          }
       })
      return res;

    },
  },
}

</script>
