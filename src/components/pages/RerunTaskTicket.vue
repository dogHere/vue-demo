<template>
<div id="root" >
    <layout page-header="级联补数-任务提交"
            active-item="rerun-task-ticket">
            <div style="width:60%;">
                <div>
                    <a-table :columns="columns"
                        :dataSource="data"
                        :pagination="false"
                        @change="hi"
                        :rowKey="record => record.clusterId+'@'+record.dagId+'@'+record.taskId"
                        :rowSelection="rowSelection"
                        
                    >
                       
                    </a-table>
                </div>
                <div class="search-group">
                        <div class="wrapper" >
                           
                         
                 <a-popover
                                    title="可以添加多个dag作为初始任务，多个dag的共同下游会被合并，避免重复执行"
                                    trigger="click"
                                    placement="bottomLeft"
                                    >
                                        <a-button class="buttonItem"  type="primary"  > 添加 </a-button>
                                        <template slot="content">
                                        
                                            clusterId
                                            <br/>
                                            <a-select
                                                showSearch
                                                :value="searchClusterValue"
                                                placeholder="input search text"
                                                style="width: 500px"
                                                :defaultActiveFirstOption="false"
                                                :showArrow="false"
                                                :filterOption="false"
                                                @change="handleChangeCluster" 
                                                @search="handleChangeCluster"
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
                                                style="width: 500px"
                                                :defaultActiveFirstOption="false"
                                                :showArrow="false"
                                                :filterOption="false"
                                                @change="handleChangeDag" 
                                                @search="handleChangeDag"
                                                :notFoundContent="null"
                                                
                                                >
                                                <a-select-option v-for="d in dags" :key="d">{{d}}</a-select-option>
                                            </a-select>
                                            <br/>
                                            taskId 
                                            <br/>
                                            <a-select
                                                showSearch
                                                :value="searchTaskValue"
                                                placeholder="input search text"
                                                style="width: 500px"
                                                :defaultActiveFirstOption="false"
                                                :showArrow="false"
                                                :filterOption="false"
                                                @change="handleChangeTask"
                                                :notFoundContent="null"
                                                
                                                >
                                                <a-select-option v-for="d in tasks" :key="d">{{toTask(d)}}</a-select-option>
                                            </a-select>
                                            <br/>
                                             <br/>
                                            <a-button type='primary'  @click="add" :disabled="!addable()">添加</a-button>
                                        </template>
                                    
                            </a-popover>

                            <a-button type='primary'  @click="onDelete"  >删除</a-button>
   

                        </div>
                </div>


                <br/>
                开始结束时间
                    <br/>
                    <a-range-picker @change="timer" >
                        <template slot="dateRender" slot-scope="current">
                            <div class="ant-calendar-date" :style="getCurrentStyle(current)">
                            {{current.date()}}
                            </div>
                        </template>
                    </a-range-picker>
                    <br/>
                    
                <br/>
                  <a-checkbox @change="ifDownstream" :checked="downstream">同时补下游数据</a-checkbox>
                <br/>
                <br/>
                  切分大小（当补多天数据的时候，可以每N天组成一个dag提交，以提高并发性。<br/>例：补10天数据，切分大小为2天,则会切成5个dag补数任务）
                  <br/>
                  <a-select   @change="onSplitValue" :value="splitValue"  style="width: 120px" >
                        <a-select-option v-for="d in cpDefaultSplitArray" :key="d">{{d}}</a-select-option>
                  </a-select>
                <br/>
                <br/>
                <div>
                    <a-textarea @change="markup" placeholder="备注（必填，用于说明补数据理由，用于审核）" :autosize="{ minRows: 4, maxRows: 6 }" />
                </div>

                <div class="search-group">
                        <div class="wrapper" >
                           
                            <a-button type='primary'  @click="onPreview"  >预览</a-button>
                            <a-button type='primary'  @click="onReset" :disabled="!currentJobId" >重置</a-button>
                            <a-button type='primary'  @click="onSubmit" :disabled="!currentJobId" > <span v-if="!currentJobId">提交</span> <a  v-if="currentJobId" :href="'#/rerun-task-status/'+currentJobId" target="_blank">提交</a></a-button>

                        </div>
                </div>
                <div v-if="currentJobId">
                 提交成功，当前jobId: {{currentJobId}} <a target="_blank" :href="'#/graph-rerun/'+currentJobId">查看血缘关系</a>（已知未实现功能：点击【查看血缘关系】跳转到新页面，新页面的任务总数统计为0。）
                </div>
            </div>
            <br>
                    注：此页面还在开发中，如果提交任务请联系@ranxianglei 协助提交
                    

     </layout>         
</div>    
</template>
<script>
import _ from 'lodash'
import {axiosRequst} from '../../util/httpUtils'
import Layout from '../common/Layout'

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


let columns = [
            {
                key:'1',
                title: 'clusterId',
                dataIndex: 'clusterId',
                width: '20%',
                
            },
            {
                 key:'2',
                title: 'dagId',
                dataIndex: 'dagId',
                width: '20%',
                
            },
            {
                 key:'3',
                title: 'taskId',
                dataIndex: 'taskId',
                width: '20%',
                
            },
           
        ]

export default {
 name: 'Graph',
  components: {
      Layout
  }
  ,
  
  data() {
    return {
         data: [],
        pagination: {},
        columns,
        searchClusterValue:null,
        searchDagValue:null,
        searchTaskValue:null,
        clusters:["airflow_dw2","airflow_global","airflow_idp1","airflow_global_prod","airflow_ods","airflow_report"],
        dags:[],
        tasks:[],
        startExecutionDate:null,
        stopExecutionDate:null,
        selectedRows:[],
        selectedRowKeys:[],
        isSelectedAll:false,
        markupData:null,
        downstream:true,
        currentJobId:null,
        cascadeSplitSize:[1,2,3,4,5,6,7,8,9,10],
        cascadeSplitDefault:[1],
        normalSplitSize:[5,6,7,8,9,10],
        normalSplitDefault:[8],
        splitDisplay:true,
        splitValue:1,
    }
  },
 
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this;
      return {
        onChange: (selectedRowKeys, selectedRows) => {
            this.selectedRows = selectedRows;
            this.selectedRowKeys = selectedRowKeys
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
          }
        }),
        hideDefaultSelections:true,
        onSelectAll:(selected, selectedRows, changeRows)=>{
            this.selectedRows = selectedRows
            this.isSelectedAll = !this.isSelectedAll 
        }
      }
    },
     cpDefaultSplitArray(){
          return (this.downstream?this.cascadeSplitSize:this.normalSplitSize)
    }
      

  },  
  methods: {
    hi(){

    },

    cpDefaultSplit(){
          return (this.downstream?this.cascadeSplitDefault[0]:this.normalSplitDefault[0])
    },
   

    ifDownstream(value){
        if(value){
            this.downstream = value.target.checked
            this.normalSplitSize = this.normalSplitSize.slice()
            this.cascadeSplitSize = this.cascadeSplitSize.slice()
            // this.cascadeSplitDefault = []
            // this.normalSplitDefault = []
            this.splitValue = this.cpDefaultSplit();
             
        }
    }
    ,
    markup(value){
        if(value&&value.target) this.markupData = value.target.value 
    }
    ,
    getCurrentStyle (current, today) {
      const style = {}
      if (current.date() === 1) {
        style.border = '1px solid #1890ff'
        style.borderRadius = '50%'
      }
      return style
    }
    ,
    handleChangeCluster(value){
      if(value){
        this.searchClusterValue = value;
        this.searchDagValue = null  
        this.searchTaskValue = null 
        
      }
    },
   
    handleChangeDag(value){
      this.searchDagValue = value 
      this.searchTaskValue = null 
      this.searchDag(this.searchDagValue,()=>{
        this.searchTask()
      })
    }
    ,

    searchDag(dagId,thenDo){
      let searchDag = null;
      if(dagId){
          searchDag = dagId;
      }else{
           searchDag = '';
      }
      if(this.searchClusterValue){
        axiosRequst({
                path: '/data/back/search/clusterId/dagId',
                params: {
                  
                  clusterId:this.searchClusterValue,
                  dagId:searchDag
                },
                type:'get'
        }).then(data=>{
            let dags =  _.get(data,'data.data');
            if(dags){
              this.dags = dags;
              if(thenDo){
                  thenDo()
              }
            }
        })
      }
    }

    ,
    searchTask(){
      if(this.searchClusterValue&&this.searchDagValue){
        axiosRequst({
                path: '/data/back/search/clusterId/dagId/taskId',
                params: {
                  clusterId:this.searchClusterValue,
                  dagId:this.searchDagValue,
                },
                type:'get'
        }).then(data=>{
            let tasks =  _.get(data,'data.data');
            if(tasks){
              this.tasks = tasks;

            }
        })
      }
    },

    handleChangeTask(value){
        if(value){
            this.searchTaskValue =this.toTask(value)
        }
    //   this.searchTask()
    },

    toTask(v){
        if(v)
        return v.split('@')[2]
    }
    ,
    addable(){
        if(this.searchClusterValue&&this.searchDagValue&&this.searchTaskValue){
            return true;
        }else{
            return false;
        }
    }
    ,
    add(){
        if(!this.addable()){
            return;
        }
        let wouldAdd = {
       
            clusterId:this.searchClusterValue,
            dagId:this.searchDagValue,
            taskId:this.searchTaskValue
        }
        if(this.isSelectedAll){
            this.selectedRows.push(wouldAdd)
        }
        
        this.data.push(wouldAdd)
        
        this.data = _.uniqWith(this.data, _.isEqual)
        this.searchClusterValue=null
        this.searchDagValue=null
        this.searchTaskValue=null
        this.dags=[]
        this.tasks=[]
    }
    ,
    onSplitValue(value){
        if(value){
            this.splitValue = value
            console.log('this.splitValue',value)
        }
    }
    ,
    onDelete () {
       
        if(this.selectedRows){
            
            
            // this.data =_.intersectionWith(this.data.map(k=>this.recordToString(k)), this.selectedRows.map(k=>this.recordToString(k)),_.isEqual).map(k=>this.stringToRecord(k))
            console.log(this.data, this.selectedRows)
            this.data = this.data.filter(item => {
                 if(this.selectedRows.some(row=>_.isEqual(row,item))){
                     return false
                 }
                 return true
            })
            // if(!this.data.length){
            //     this.selectedRows = []
            // }
        }
      
    },
    onReset(){
        this.currentJobId = null;
    }
    ,
    onPreview(){
        if(!this.currentJobId) this.submit()
    }
    ,
    onSubmit(){
        if(!this.currentJobId){
            this.submit(true)
        }else{
            this.submitJobId(this.currentJobId)
        }
    }
    ,
    submitJobId(currentJobId){
        if(currentJobId){
            axiosRequst({
                path: '/data/back/submit/job',
                params: {
                  jobId:currentJobId,
                  maxRuns:this.splitValue
                },
                type:'post',
               
            }).then(data=>{
                let d =  _.get(data,'data.data');
                if(d){
                    this.currentJobId = null 
                }
            })
        }
    }
    ,
    submit(edit){
        if(!(this.data&&this.data.length>0&&this.markupData)){
            return 
        }
        let editMode = false 
        if(edit){
            editMode = true 
        }

        let data = [];
        _.cloneDeep(this.data).forEach(d=>{
            data.push({
                task:d,
                startDate:this.startExecutionDate,
                endDate:this.stopExecutionDate
            })
        })
        
        axiosRequst({
                path: '/data/back/create/job2',
                params: {
                  reasonDesc:this.markupData,
                  downstream:this.downstream?true:false,
                  editMode:editMode,
                  maxRuns:this.splitValue
                },
                type:'post',
                data:data 
        }).then(data=>{
            let d =  _.get(data,'data.data');
            if(d){
              console.log(d,'submit');
              this.currentJobId = d
            }
        })
    }
    ,
    
    
    timer(value){
        console.log('timer',value)
        
        this.startExecutionDate=value[0].valueOf()
        this.stopExecutionDate=value[1].valueOf()
    }
  },
}

</script>


<style lang="scss">
.search-group{
  background-color: rgb(240, 242, 245);
  height: 20%;
  display: flex;
  flex-direction: row;
  padding-right: 10px;
  padding-top: 10px;
  flex-wrap: wrap;
   padding-top: 10px;
   padding-bottom: 3px;
   padding-left: 10px;
   padding-right: 10px;

}

.wrapper{
    // button,input,span,i,div{
    //     margin-right:10px;
    //     margin-bottom:5px;
    //     margin-top:5px;
    // };
    display: flex;
    flex-wrap: wrap;
        button,input,span{
        margin-right:8px;
        margin-bottom:5px;
        margin-top:5px;
    }
    
}
#graph-wrapper .network{
  width:100%;
  height:80vh;
}

</style>