<template>
<div id="root" >
    <layout page-header="图可视化2"
            active-item="graph2">

        <CommonGraph ref="commonGraph" >
                <template slot="header">
                <a-input class="jobIdSet" placeholder="jobId" @change="setNowJobId"></a-input>

                <a-button  type="primary" @click="showAll"  > 显示全部任务 </a-button>
                <a-button  type="primary" @click="showRoot" > 显示根节点 </a-button>
                <a-button  type="primary" @click="showFailed" > 显示失败任务 </a-button>
                <a-button  type="primary" @click="showUpstream" > 显示选中节点上游 </a-button>
                <a-button  type="primary" @click="showDownstream" > 显示选中节点下游</a-button>
                <a-button  type="primary" @click="showRunning" > 显示在运行 </a-button>
                <a-button  type="primary" @click="showNotRunningTop" > 显示未运行最上层 </a-button>
                <a-button  type="primary" @click="showPath" > 显示两节点之间路径 </a-button>
                <a-popover
                  title="显示一个点"
                  trigger="click"
                  placement="bottomLeft"
                >
            
                <a-button  type="primary" > 显示一个点 </a-button>
                    <template slot="content">
                        <a-input placeholder="clusterId" v-model="inputClusterId"></a-input><br/> <br/>
                        <a-input placeholder="dagId"    v-model="inputDagId" ></a-input><br/> <br/>
                        <a-input placeholder="taskId"   v-model="inputTaskId" ></a-input><br/> <br/>
                        <a-button icon="search" @click="showV" >Search</a-button>
                    </template>
              </a-popover>
                </template>
                
              <template slot="status">
                <div >
                  
                  <div class="nowShowData" v-for="key in Object.keys(nowShowData===null?{}:nowShowData)">
                      <font color="red">{{key}}:</font>     {{nowShowData[key]}}
                  </div>
                </div>
              </template>
              
        </CommonGraph>
       
    </layout>
</div>    
</template>
<script>
import CommonGraph from '../common/CommonGraph'
import Layout from '../common/Layout'
import _ from 'lodash'
import axiosRequst from '../../util/httpUtils'

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

export default {
 name: 'Graph',
  components: {
    Layout,
    CommonGraph
  },
  data() {
    return {
      nowJobId:null,
      registerV:{},
      registerVCnt:1,
      registerTasks:{},
      nowSelected:[],
      nowClicked:null,
      inputClusterId:null,
      inputDagId:null,
      inputTaskId:null,
      nowShowData:null,
    }
  },
  computed: {
    showVData(){
      return {
          clusterId: this.inputClusterId,
          dagId: this.inputDagId,
          taskId: this.inputTaskId,
      }
    },
  },  
  methods: {
    
    str2Task(str){
      if(str){
        const arr = str.split('@')
        return{
          clusterId:arr[0],
          dagId:arr[1],
          taskId:arr[2]
        }
      }else{
        return null;
      }
    }
    ,
    setNowJobId(data){
      const jobId=Number.parseInt(data.target.value)

      if(jobId){
          this.nowJobId = jobId;
          console.log("jobId",jobId)
      }
    },
    helloworld(data){
        console.log('hellowrold',data.target.value)
    },
    register(v){
      if(!this.registerV[v]){
          this.registerV[v] = this.registerVCnt;
          this.registerVCnt = this.registerVCnt+1;
      }
    }
    ,
    getId(v){
      if(!this.registerV[v]){
          this.register(v)
      }
      
      return this.registerV[v]
      
    }
    ,dealShowStatus(key){
        if(key === 'dagStatus'){
          return true
        }
        if(key === 'upperDagNum'){
          return true
        }
        if(key === 'upperDagSuccessNum'){
          return true
        }
        if(key === 'id'){
          return true
        }
        if(key === 'startTime'){
          return true
        }
        if(key === 'endTime'){
          return true
        }        
        if(key === 'executionClient'){
          return true
        }  
        if(key === 'priority'){
          return true
        }   
        return false
        
    }
    ,dealStatus(status){
        if(status === -1){
          return '未初始化';
        }
        if(status === 0){
          return '待运行';
        }

        if(status === 1){
          return '运行中'
        }
        if(status === 2){
          return '运行成功'
        }

        if(status === 3){
          return '运行失败'
        }

        if(status === 4){
          return '正在开始运行'
        }

        if(status === 5){
          return '待审批'
        }

        if(status === 6){
          return '审批未通过'
        }

        if(status === 11){
          return '正在停止'
        }
        return '未知';
    }
    ,
    dealUinxtime(unix){
      if(!unix){
        return '-'
      }
      return new Date(unix).format("yyyy-MM-dd hh:mm:ss")
    }
    ,

    dealColor(task){
        if(!task){
          return 'rgb(255,168,7)';
        }
        if (task.dagStatus === 0) {
          return '#f0fbff';
        }
        if (task.dagStatus === 1 || task.dagStatus === 4) {
          return 'lime';
        }
        if (task.dagStatus === 2) {
          return 'rgba(97,195,238,0.5)';
        }
        if (task.dagStatus === 3) {
          return 'red';
        }
        return 'rgb(255,168,7)';
    }
    ,
    dealV (v){
      this.register(v)
      const task = this.registerTasks[v]
      return {
            id:v
        ,label:this.getId(v)+"" 
        ,color:this.dealColor(task)
      }
    },

    dealE (e){
                  return {
                    id:   e.source.key+"->"+e.dest.key, 
                    from: e.source.key,
                    to:   e.dest.key
                  }
                },
    addSelectListen(){
        this.$refs.commonGraph.getNetwork().on('click',(parms)=>{
          console.log('click ',parms)
          if(parms&&parms.nodes&&parms.nodes.length>0){
            const v = parms.nodes[0];
            this.nowClicked = this.str2Task(v)

            this.nowShowData =  Object.assign({},this.nowClicked) ;
            if(v){
              const task = this.registerTasks[v]
              if(task){
                Object.keys(task).forEach(t=>{
                    if(this.dealShowStatus(t)){
                      if(t==='dagStatus'){
                          this.nowShowData['状态'] = this.dealStatus(task[t])
                      }else if(t==='upperDagNum'){
                          this.nowShowData['上游task数'] = task[t];
                      }else if(t==='upperDagSuccessNum'){
                          this.nowShowData['上游成功task数'] = task[t];
                      }else if(t==='id'){
                          this.nowShowData['taskId'] = task[t];
                      }else if(t==='startTime'){
                          this.nowShowData['开始时间'] = this.dealUinxtime(task[t]);
                      }else if(t==='endTime'){
                          this.nowShowData['结束时间'] = this.dealUinxtime(task[t]);
                      }else if(t==='executionClient'){
                          this.nowShowData['运行方式'] = task[t];
                      }else if(t === 'priority'){
                          this.nowShowData['优先级'] = task[t];
                      }
                    }
                })
              }
            }
            

            this.nowSelected = parms.nodes.map(k=>this.str2Task(k)).filter(k=>k!=null)
            console.log('this.nowClicked',this.nowClicked,'this.nowSelected',this.nowSelected,'nowClicked task info ',this.registerTasks[v])
          }
        })
    } ,           
    dealResponse(data,mode){
        if(!mode){
          mode = 'add'
        }
        console.log('data',data)
        let tasks = _.get(data,'data.data.tasks')
        if(tasks){
          Object.keys(tasks).forEach((task)=>{
            this.registerTasks[task] = tasks[task];
          })
        }
        let graph = _.get(data,'data.data.graph');
        if(graph){
            this.$refs.commonGraph.update({
                v:graph.v,
                e:graph.e,
            },mode,this.dealV,this.dealE)
            this.addSelectListen()
        }

    },
    showAll(){
      if(this.nowJobId){
        axiosRequst({
                path: '/data/back/edit/job/show/all',
                params: {
                  jobId:this.nowJobId
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },
    showRoot(){
      if(this.nowJobId){
        axiosRequst({
                path: '/data/back/edit/job/show/root',
                params: {
                  jobId:this.nowJobId
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },

    showDownstream(){
      if(this.nowJobId&&this.nowClicked){
        axiosRequst({
                path: '/data/back/edit/job/show/downstream',
                params: {
                  jobId:this.nowJobId,
                  ... this.nowClicked
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },

    showUpstream(){
      if(this.nowJobId&&this.nowClicked){
        axiosRequst({
                path: '/data/back/edit/job/show/upstream',
                params: {
                  jobId:this.nowJobId,
                  ... this.nowClicked
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },

    showRunning(){
      if(this.nowJobId){
        axiosRequst({
                path: '/data/back/edit/job/show/running',
                params: {
                  jobId:this.nowJobId,
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },

   showFailed(){
      if(this.nowJobId){
        axiosRequst({
                path: '/data/back/edit/job/show/failed',
                params: {
                  jobId:this.nowJobId,
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },
    showNotRunningTop(){
      if(this.nowJobId){
        axiosRequst({
                path: '/data/back/edit/job/show/notrun/first',
                params: {
                  jobId:this.nowJobId,
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },
    showPath(){
      if(this.nowJobId&&this.nowSelected&&this.nowSelected.length>=2){
        axiosRequst({
                path: '/data/back/edit/job/show/path',
                params: {
                  jobId:this.nowJobId,
                },
                type:'post',
                data:this.nowSelected
        }).then(this.dealResponse)
      }
    },
    showV(){
      console.log(this.showVData,'showVData')
      const {clusterId,dagId,taskId} = this.showVData;
      if(this.nowJobId  && clusterId && dagId && taskId ){
        axiosRequst({
                path: '/data/back/edit/job/show/v',
                params: {
                  jobId:this.nowJobId,
                  ...  this.showVData
                },
                type:'post',
                
        }).then(this.dealResponse)
      }
    },
  },
}
</script>
<style scoped>

#root {
  min-width: 900px;
}
.wrapper{
    button,input,span{
        margin-right:10px;
    }
}
.jobIdSet{
  width:100px;
}
.nowShowData{
  display:inline-block;
  margin-right:10px;
}
</style>