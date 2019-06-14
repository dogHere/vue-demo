<template>
<div id="root" >
    <layout page-header="级联补数-图可视化"
            active-item="graph-rerun">

        <CommonGraph ref="commonGraph" >
                <template slot="header">
                <a-input class="jobIdSet inputItem"  placeholder="jobId" @change="setNowJobId" ></a-input>
                <a-button class="buttonItem"  type="primary" @click="reflushTaskStatus" :disabled="true">{{reflushContent}}</a-button>
                <a-icon   class="iconItem"  :style="'color: black;pointer-events: none;'" type="border-horizontal"    ></a-icon>


                <!--
                <a-button class="buttonItem" type="primary" @click="succeedV" :disabled="!nowClicked" >标记成功</a-button>
                -->
                <a-tooltip placement="topLeft" >
                      <template slot="title">
                        <span>标记成功</span>
                      </template>
                      <div :style="(nowClicked && !nowJobIdIsInStopQueue)?'color: green;cursor:pointer':'cursor:not-allowed;'" >
                        <a-icon  class="iconItem"  @click="succeedV" 
                              :disabled="!nowClicked" :style="(nowClicked && !nowJobIdIsInStopQueue)?'color: green;cursor:pointer':'pointer-events: none;'"  type="check-circle"   ></a-icon>
                      </div>
                </a-tooltip>

                <a-tooltip placement="topLeft" >
                      <template slot="title">
                        <span>标记待运行</span>
                      </template>
                      <a-icon  class="iconItem"  @click="clearV" :disabled="!nowClicked" :style="(nowClicked && !nowJobIdIsInStopQueue)?'color: #1890ff;cursor:pointer':''"  type="clock-circle"   ></a-icon>
                </a-tooltip>
                <a-tooltip placement="topLeft" >
                      <template slot="title">
                        <span>加入运行队列</span>
                      </template>
                      <a-icon  class="iconItem"  @click="startV" :disabled="!nowClicked" :style="(nowClicked && nowJobIdIsInStopQueue)?'color: #008000;cursor:pointer':''"  type="play-circle"   ></a-icon>
                </a-tooltip>
                <a-tooltip placement="topLeft" >
                      <template slot="title">
                        <span>加入停止队列</span>
                      </template>
                      <a-icon  class="iconItem"  @click="stopV" :disabled="!nowClicked" :style="(nowClicked && !nowJobIdIsInStopQueue)?'color: #f8666e;cursor:pointer':''"  type="close-circle"   ></a-icon>
                </a-tooltip>
                <!--
                <a-button class="buttonItem"  type="primary" @click="stopV" :disabled="!nowClicked" >停止运行</a-button>
                -->

                <a-icon   class="iconItem"  :style="'color: black;pointer-events: none;'" type="border-horizontal"    ></a-icon>

                <a-tooltip placement="topLeft" >
                      <template slot="title">
                        <span>显示在运行任务</span>
                      </template>
                      <!--
                                              <a-button class="buttonItem"  type="primary" @click="showRunning" :disabled="!nowJobIdExists"> 显示在运行</a-button>

                      -->   
                     <a-icon  class="iconItem"  @click="showRunning" :disabled="!nowJobIdExists" :style="!nowJobIdExists?'color: #d9d9d9;cursor: not-allowed;':'color: green;'"  type="smile"    ></a-icon>

                </a-tooltip>

               <a-tooltip placement="topLeft" >
                      <template slot="title">
                        <span>显示失败任务</span>
                      </template>
                      <!--
                                              <a-button class="buttonItem"  type="primary" @click="showRunning" :disabled="!nowJobIdExists"> 显示在运行</a-button>

                      -->   
                     <a-icon  class="iconItem"  @click="showFailed" :disabled="!nowJobIdExists" :style="!nowJobIdExists?'color: #d9d9d9;cursor: not-allowed;':'color: #f8666e;'"  type="frown"    ></a-icon>

                </a-tooltip>
                <!--
                <a-button class="buttonItem"  type="primary" @click="showFailed" :disabled="!nowJobIdExists">显示失败</a-button>
                -->

                <!--
                <a-button class="buttonItem"  type="primary" @click="showRunning" :disabled="!nowJobIdExists"> 显示在运行</a-button>
                -->
               <a-tooltip placement="topLeft" >
                      <template slot="title">
                        <span>显示未运行最上层节点</span>
                      </template>
                      <!--
                                              <a-button class="buttonItem"  type="primary" @click="showRunning" :disabled="!nowJobIdExists"> 显示在运行</a-button>

                      -->   
                     <a-icon  class="iconItem"  @click="showNotRunningTop" :disabled="!nowJobIdExists" :style="!nowJobIdExists?'color: #d9d9d9;cursor: not-allowed;':'color: #cb4eb3;'"  type="meh"    ></a-icon>

                </a-tooltip>       
                <!--         
                <a-button class="buttonItem"  type="primary" @click="showNotRunningTop" :disabled="!nowJobIdExists">显示未运行最上层</a-button>
                -->
                <a-icon   class="iconItem"  :style="'color: black;pointer-events: none;'" type="border-horizontal"    ></a-icon>

                <a-button class="buttonItem"  type="primary" @click="showRoot" :disabled="!nowJobIdExists">显示根节点</a-button>
                <a-button class="buttonItem"  type="primary" @click="showUpstream" :disabled="!nowJobIdExists||!nowClicked">显示节点上游</a-button>
                <a-button class="buttonItem"  type="primary" @click="showDownstream" :disabled="!nowJobIdExists||!nowClicked">显示节点下游</a-button>
                <a-button class="buttonItem"  type="primary" @click="showPath" :disabled="!nowJobIdExists|| !nowSelected || nowSelected.length<2">显示两点间路径</a-button>
                <div style="display:'inline-block'">
                    <a-popover
                      title="显示一个点"
                      trigger="click"
                      placement="bottomLeft"
                      
                    >
                
                    <a-button class="buttonItem"  type="primary" :disabled="!nowJobIdExists" > 显示一个点 </a-button>
                        <template slot="content">
                            <a-input placeholder="clusterId" v-model="inputClusterId"></a-input><br/> <br/>
                            <a-input placeholder="dagId"    v-model="inputDagId" ></a-input><br/> <br/>
                            <a-input placeholder="taskId"   v-model="inputTaskId" ></a-input><br/> <br/>
                            <a-button icon="search" @click="showV" >Search</a-button>
                        </template>
                  </a-popover>
              </div>
               <a-icon   class="iconItem"  :style="'color: black;pointer-events: none;'" type="border-horizontal"    ></a-icon>

                </template>
              
              <template slot="status">
                <div >
                  <br/>
                  
                  <a-card  v-if="nowJobId"   :bodyStyle="{padding:'3px'}"
                              :hoverable="true"
                              class="card-warpper">
                        <div class="cardItem">
                          <div v-for="key in Object.keys(nowJobIdStatus===null?{}:nowJobIdStatus)"
                              :key="key"
                              class="item">
                            <div class="value"><font style="font-weight: bold">{{ key }}</font>: {{ nowJobIdStatus[key] }}</div>

                          </div>
                        </div>
                  </a-card>
                  <a-card  v-if="nowClicked"   :bodyStyle="{padding:'3px'}"
                              :hoverable="true"
                              class="card-warpper">
                        <div class="cardItem">
                          <div v-for="key in Object.keys(nowShowData===null?{}:nowShowData)"
                              :key="key"
                              class="item">
                            <div class="value"><font style="font-weight: bold">{{ key }}</font>: {{ nowShowData[key] }}</div>

                          </div>
                        </div>
                  </a-card>

                  <!--
                  <div class="nowShowData" v-for="key in Object.keys(nowShowData===null?{}:nowShowData)">
                      <font color="red">{{key}}:</font>     {{nowShowData[key]}}
                  </div>
                  -->
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
import {axiosRequst} from '../../util/httpUtils'

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
      nowJobIdStatus:null,
      nowJobIdExists:null,
      reflushContent:"刷新节点状态",
      reflushTotalTime:30,
      nowFlushStart:false,
      nowCountDown:null,
      nowJobIdIsInStopQueue:null,
    }
  },
  // watch: {
  //   nowJobIdExists:{
  //     handler(o){
  //       if(!this.nowJobIdExists&&this.nowCountDown)
  //       {
  //          console.log('clearInterval in watch')
  //          clearInterval(this.nowCountDown)
  //       }
  //     }
  //   }
  // },
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
        
    reset(){
      this.$refs.commonGraph.clearAll()
      this.nowJobId = null;
      this.registerV = {};
      this.registerVCnt= 1;
      this.registerTasks = {}
      this.nowSelected=[]
      this.nowClicked = null
      this.inputClusterId =null
      this.inputDagId = null
      this.inputTaskId = null
      this.nowShowData = null
      this.nowJobIdStatus =null
      this.nowJobIdExists =null

      this.reflushContent = "刷新节点状态"
      this.reflushTotalTime = 30
      this.nowFlushStart = false
      this.nowJobIdIsInStopQueue = null
    },
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
    countDown(){
      // console.log('call countDown')
      if(!this.nowJobIdExists||this.nowFlushStart){
          return
      }
      // console.log('countDown nowCountDown',this.nowCountDown)
      if(this.nowCountDown){
        // console.log('countDown clear nowCountDown')
        clearInterval(this.nowCountDown)
      }
      this.nowFlushStart = true
      let clock = setInterval(() => {
            if(!this.nowJobIdExists&&this.nowCountDown){
                this.reflushContent = "刷新节点状态"
                
            }else{
              if(this.reflushTotalTime==0){
                  this.reflushTaskStatus()
                  this.reflushTotalTime=30
              }
              this.reflushTotalTime--
              this.reflushContent = this.reflushTotalTime + 's后刷新状态'
            }
            
        },1100)
        this.nowCountDown = clock
    }
    ,
    reflushTaskStatus(){
        // console.log('reflushTaskStatus...')
        if(this.registerV){
          Object.keys(this.registerV).forEach(v=>{
            this.showV(this.str2Task(v),true)
          })
        }
    }
    ,
    setNowJobId(data){
      const jobId=Number.parseInt(data.target.value)
      this.reset()
      if(jobId){
          this.nowJobId = jobId;
          // console.log("jobId",jobId)
          this.initShow()
      }
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
        if(key === 'sourceClusterId'){
          return true
        }  
        if(key === 'sourceDagId'){
          return true
        }  
        if(key === 'sourceTaskId'){
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
        if(task.priority>2){
          return '#7d8791';
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
    dealPriority(priority){
        if(!priority){
          return ""
        }

    }
    ,
    convertToStatus(task){
      if(!task){
        return {}
      }
      let res = {}
      Object.keys(task).forEach(t=>{
        if(this.dealShowStatus(t)){
           if(t==='dagStatus'){
                res['状态'] = this.dealStatus(task[t])
            }else if(t==='upperDagNum'){
                res['上游task数'] = task[t];
            }else if(t==='upperDagSuccessNum'){
                res['上游成功task数'] = task[t];
            }else if(t==='id'){
                res['id'] = task[t];
            }else if(t==='startTime'){
                res['开始时间'] = this.dealUinxtime(task[t]);
            }else if(t==='endTime'){
                res['结束时间'] = this.dealUinxtime(task[t]);
            }else if(t==='executionClient'){
                res['运行方式'] = task[t];
            }else if(t === 'priority'){
                res['优先级'] = task[t];
            }else if(t === 'sourceClusterId'){
                res['clusterId'] = task[t];
            }else if(t === 'sourceDagId'){
                res['dagId'] = task[t];
            }else if(t === 'sourceTaskId'){
                res['taskId'] = task[t];
            }
        }
      })
      return res;
    }
    ,
    convertToTitle(task){
        if(!task){
          return "";
        }
        const res = this.convertToStatus(task)
        let title = "";
        Object.keys(res).forEach(k=>{
            title=title+k+":"+res[k]+"<br/>";
        })
        return title;
    }
    ,
    dealV (v){
      this.register(v)
      const task = this.registerTasks[v]
      return {
            id:v
        ,label:this.getId(v)+"" 
        ,color:this.dealColor(task)
        ,title:this.convertToTitle(task)
       , shape: 'ellipse'
      }
    },

    dealE (e){
      return {
        id:   e.source+"->"+e.dest, 
        from: e.source,
        to:   e.dest
      }
    },
    addSelectListen(){
        this.$refs.commonGraph.getNetwork().on('click',(parms)=>{
          // console.log('click ',parms)
          if(parms&&parms.nodes&&parms.nodes.length>0){
            const v = parms.nodes[0];
            this.nowClicked = this.str2Task(v)

            this.nowShowData =  Object.assign({},this.nowClicked) ;
            if(v){
              const task = this.registerTasks[v]
              if(task){
                if(task.priority>2){
                    this.nowJobIdIsInStopQueue = true
                }else{
                    this.nowJobIdIsInStopQueue = false
                }
                // console.log('this.nowJobIdIsInStopQueue',this.nowJobIdIsInStopQueue)
                Object.assign(this.nowShowData,this.convertToStatus(task))

              }
            }
          
            this.nowSelected = parms.nodes.map(k=>this.str2Task(k)).filter(k=>k!=null)
            // console.log('this.nowClicked',this.nowClicked,'this.nowSelected',this.nowSelected,'nowClicked task info ',this.registerTasks[v])
          }else{
            this.nowClicked = null;
            this.nowShowData = null;
          }
        })
    } ,    
    registerTheTasks(data){
        let tasks = _.get(data,'data.data.tasks')
        if(tasks){
          Object.keys(tasks).forEach((task)=>{
            this.registerTasks[task] = tasks[task];
          })
        }
    }       ,
    renderTheGraph(data,mode,focus){
        let graph = _.get(data,'data.data.graph');
        if(graph&&this.$refs.commonGraph){
            this.$refs.commonGraph.update({
                v:graph.v,
                e:graph.e,
            },mode,this.dealV,this.dealE,focus)
            this.addSelectListen()
        }
    },
    dealResponse(data,thenDo,mode,focus){
        if(!mode){
          mode = 'add'
        }
        // console.log('data',data)
        this.registerTheTasks(data)
        this.renderTheGraph(data,mode,focus)
        // let graph = _.get(data,'data.data.graph');
        if(thenDo){
          thenDo()
        }
    },
    updateThisJobIdStatus(status){
        if(!status){
                this.nowJobIdStatus = {"当前jobId":this.nowJobId,"状态":"该jobId不存在"}
                // this.nowJobIdStatus = "该jobId:"+this.nowJobId+" 不存在"
                this.nowJobIdExists = false;
        }else{
              this.nowJobIdStatus = {"当前jobId":this.nowJobId,"状态":"ok"}
              // this.nowJobIdStatus = "当前jobId:"+this.nowJobId;
              this.nowJobIdExists = true;
              this.countDown()
        }
    },
    initShow(){
      axiosRequst({
                path: '/data/back/edit/job/show/root',
                params: {
                  jobId:this.nowJobId,
                  rootOnly:true
                },
                type:'post'
      }).then(data=>{
        this.registerTheTasks(data)
        this.renderTheGraph(data)
        let graphRoot = _.get(data,'data.data.graph');
        if(graphRoot&&graphRoot.v&&graphRoot.v.length>0){
          this.updateThisJobIdStatus(true)
          axiosRequst({
                        path: '/data/back/edit/job/show/running',
                        params: {
                          jobId:this.nowJobId,
                        },
                        type:'post'
          }).then(data=>{
              this.registerTheTasks(data)
              this.renderTheGraph(data)

              let graph = _.get(data,'data.data.graph');

              if(graph&&graph.v){
                 
                 graph.v.forEach(sv=>{
                   graphRoot.v.forEach(rootV=>{
                      this.showPath([this.str2Task(sv),this.str2Task(rootV)],()=>{
                        this.showDownstream(this.str2Task(sv))
                      })
                      
                   })
                 })
              }
          })    
        }else{
            this.updateThisJobIdStatus(graphRoot&&graphRoot.v&&graphRoot.v.length>0)
        }
          
      })
    }
    ,
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

    showDownstream(nowClicked){
      // console.log('show downstream ',nowClicked)
      let ids = null;
      if(nowClicked&&nowClicked.clusterId&&nowClicked.dagId&&nowClicked.taskId){
        ids = nowClicked
      }else{
        ids = this.nowClicked
      }
      if(this.nowJobId&&ids){
        axiosRequst({
                path: '/data/back/edit/job/show/downstream',
                params: {
                  jobId:this.nowJobId,
                  ... ids
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
    showPath(nowSelected,thenDo){
      // console.log('showPath',nowSelected)  

      let ids =  null;
      if(nowSelected&&Array.isArray(nowSelected)&&nowSelected.length>=2){
            ids = nowSelected
        }else{
            ids=this.nowSelected
        }
      if(this.nowJobId&&ids&&ids.length>=2){
        axiosRequst({
                path: '/data/back/edit/job/show/path',
                params: {
                  jobId:this.nowJobId,
                },
                type:'post',
                data:ids
        }).then((data)=>this.dealResponse(data,thenDo))
      }
    },
    showV(showVData,focus){
      let ids = null;
      if(showVData&&showVData.clusterId){
        ids = showVData
      }else{
        ids = this.showVData
      }
      // console.log(ids,'showVData')
      const {clusterId,dagId,taskId} = ids;
      if(this.nowJobId  && clusterId && dagId && taskId ){
        axiosRequst({
                path: '/data/back/edit/job/show/v',
                params: {
                  jobId:this.nowJobId,
                  ...  ids
                },
                type:'post',
                
        }).then((data)=>this.dealResponse(data,null,null,focus))
      }
    },
    startV(){
      if(this.nowJobId&&this.nowClicked){
        axiosRequst({
                path: '/data/back/edit/job/status/start/node',
                params: {
                  jobId:this.nowJobId,
                  ... this.nowClicked
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },
    stopV(){
      if(this.nowJobId&&this.nowClicked){
        axiosRequst({
                path: '/data/back/edit/job/status/stop/node',
                params: {
                  jobId:this.nowJobId,
                  ... this.nowClicked
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },
    pauseV(){
      if(this.nowJobId&&this.nowClicked){
        axiosRequst({
                path: '/data/back/edit/job/status/pause/node',
                params: {
                  jobId:this.nowJobId,
                  ... this.nowClicked
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },
    succeedV(){
      if(this.nowJobId&&this.nowClicked){
        axiosRequst({
                path: '/data/back/edit/job/status/succeed/node',
                params: {
                  jobId:this.nowJobId,
                  ... this.nowClicked
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },
     clearV(){
      if(this.nowJobId&&this.nowClicked){
        axiosRequst({
                path: '/data/back/edit/job/status/clear/node',
                params: {
                  jobId:this.nowJobId,
                  ... this.nowClicked
                },
                type:'post'
        }).then(this.dealResponse)
      }
    },
  },
}
</script>
<style scoped lang="scss">

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
.iconItem{
  cursor     : not-allowed;
    color    :  #d9d9d9;
    font-size: 200%;
      margin-right: 10px;
  margin-bottom: 10px;
}
.buttonItem{
  margin-right: 10px;
  margin-bottom: 10px;
}
.inputItem{
    margin-right: 10px;
  margin-bottom: 10px;
}

.card-warpper {
  width: 100%;
}

.cardItem {
  display: flex;
  flex-wrap: wrap;
  .item {
    
    text-align: left;
    margin-right: 30px;
    .value {
      font-size: 15px;
      font-weight: 500;
      color: #000;
    }
    
  }
}


</style>