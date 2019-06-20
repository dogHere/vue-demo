<template>
  <div id="root">
    <layout page-header="字段级别血缘-可视化"
            active-item="graph-field">
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
            :ifShowKeyPath="ifShowKeyPath"
            :ifShowKeyPathOnly="ifShowKeyPathOnly"
            :defaultSearchTarget="defaultSearchTarget"
            
           >



           <template slot="searchTable">
             <div>
               输入[库名.表名],或者报表名
               <br/>
               
               <a-select
                  showSearch
                  :value="searchTableValueTable"
                  placeholder="input search text"
                  style="width: 500px;padding-top: 10px;"
                  :defaultActiveFirstOption="false"
                  :showArrow="false"
                  :filterOption="false"
                  @search="handleSearchTable"
                  @change="handleChangeTable"
                  :notFoundContent="null"
                >
                  
                  <a-select-option v-for="d in searchTableDataTable" :key="d">{{d}}</a-select-option>

                </a-select>
                <br/>
                选择字段名
                <br/>

                <a-select
                  showSearch
                  :value="searchTableValue===null?'':toField(searchTableValue)"
                  placeholder="input search text"
                  style="width: 500px;padding-top: 10px;"
                  :defaultActiveFirstOption="false"
                  :showArrow="false"
                  :filterOption="false"
                  :notFoundContent="null"
                  @change="handleChangeField"
                >
                  
                  <a-select-option v-for="d in searchTableData" :key="d">{{toField(d)}}</a-select-option>

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
let pDate = theDefaultPate()
let searchGroups = [""]
export default {
  name: 'graph-field',
  components: {
    Layout,
    GraphView,
  },
  data(){
    return {
        searchTableDataTable:[],
        searchTableData:[],
        searchTableValue:null,
        searchTableValueTable:null,
        searchGroups:searchGroups,
        ifShowKeyPath:false,
        ifShowKeyPathOnly:false,
        defaultSearchTarget:"upstream",

    }
  }
  ,

  methods: {

      toField(value){
          if(value){
              return value.split('.')[2]
          }
      },
      handleChangeField(value){
          this.searchTableValue = value
      }
    ,
    handleChangeTable(value){
      this.searchTableValueTable = value
      this.handleSearchTable(value,(value)=>{
          this.handleSearchField(value)
      })
    }
    ,
    handleSearchField(value){
        let arg = {
                path: '/internal/dg/findwhyslow/graph/field/search',
                params: {
                  table:value
                },
                type:'get'
        };
        axiosRequst(arg).then(data=>{
            let list = _.get(data,'data.data');
            if(list&&list.length>0){
                this.searchTableData = list;
            }else{
              this.searchTableData=[]
            }
        })
    }
    ,
    handleSearchTable(value,thenDo){
      if(value){
        this.searchTableValueTable = value
        let arg = {
                path: '/internal/dg/findwhyslow/graph/table/search',
                params: {
                  table:value,
                  pDate:pDate,
                },
                type:'get'
        };
        axiosRequst(arg).then(data=>{
            let list = _.get(data,'data.data');
            if(list&&list.length>0){
                this.searchTableDataTable = list;
                if(thenDo){
                    if(this.searchTableDataTable&&this.searchTableDataTable.length==1){
                        thenDo(this.searchTableValueTable)
                    }
                }
            }else{
              this.searchTableDataTable=[]
            }
        })
      }
    }
    ,
    showUpstreamAPI:(value)=>{
      return searchGroups.map(p=>{
        return {
          path: '/internal/dg/findwhyslow/graph/field/upstream',
          params: {
              field:value,
              pDate:p,
          },
          type:'get',
          groupId:p,
        }
      })
    },
    showDownstreamAPI:(value)=>{
      return searchGroups.map(p=>{
          return {
            path: '/internal/dg/findwhyslow/graph/field/downstream',
            params: {
                field:value,
                pDate:p,
            },
            type:'get',
            groupId:p,
          }
      })  
    },
    showPathAPI:(v1,v2)=>{
      return searchGroups.map(p=>{
        return {
            path: '/internal/dg/findwhyslow/graph/field/path',
            params: {
                field:v1,
                field2:v2,                
            } ,
            type:'get',
            groupId:p,
        }
      })
    },
    showKeyPathAPI:(v,keyPathOnly)=>{
      return searchGroups.map(p=>{
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
                colName:arr[2],
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
            "字段名":prop["colName"],
          }
       })
      return res;

    },
  },
}

</script>
