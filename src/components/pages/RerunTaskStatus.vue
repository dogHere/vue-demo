<template>
<div id="root" >
    <layout page-header="级联补数-任务状态"
            active-item="rerun-task-status">
                            
                        <div style="float:right" >
                            
                           <a-popover
                                    title="通过jobId或dagId搜索提交的任务"
                                    trigger="click"
                                    placement="bottomLeft"
                                    v-model="searchVisible"
                                    >
                                <a-button type="primary">搜索</a-button>
                                 <template slot="content">
                                      通过jobId精确搜索
                                      <br/>
                                      <a-input  placeholder="jobId" @change="onJobId"></a-input>
                                      通过DagId模糊搜索
                                      <a-input  placeholder="dagId" @change="onDagId"></a-input>
                                      <hr>
                                        <div
                                        class="demo-infinite-container"
                                        v-infinite-scroll="hi"
                                        :infinite-scroll-disabled="false"
                                        :infinite-scroll-distance="10"
                                        >
                                            <a-list
                                                :dataSource="jobStatusByDag"
                                            >
                                                <a-list-item slot="renderItem" slot-scope="item, index">
                                                    <a-list-item-meta :description="item.sourceDagId">
                                                        <a slot="title" >{{item.id}}</a>
                                                        
                                                    </a-list-item-meta>
                                                   <div>
                                                     <p><span class='prop'>状态</span>:<font :color="colorId(item)" >{{item.jobStatus}}</font></p>
                                                     <p><span class='prop'>开始时间</span>:{{item.execStartDate}}</p>
                                                     <p><span class='prop'>结束时间</span>:{{item.execEndDate}}</p>
                                                     <p><span class='prop'>描述</span>:{{item.jobReasonDesc}}</p>
                                                     <a-button type="primary" @click="lookupDetail(item.id)"> 查看详细 </a-button>
                                                    </div>
                                                </a-list-item>
                                                
                                            </a-list>
                                        </div>
                                 </template>
                                
                           </a-popover>
                        </div>
                
                <br>
                <div  v-if="!jobFatherStatus" >无数据，点击右侧搜索按钮，搜索已经提交的级联任务</div>
                <div v-if="jobFatherStatus">
                            <p v-if="jobFatherStatus.jobStatus==='未初始化'"><font color="red">任务正在初始化中，页面数据会自动刷新。</font></p>

                            <p><span class='prop'>当前状态</span>:<font :color="colorId(jobFatherStatus)">{{jobFatherStatus.jobStatus}}</font></p>
                            <p><span class='prop'>clusterId</span>:{{jobFatherStatus.sourceClusterId}}</p>
                            <p><span class='prop'>dagId</span>:{{jobFatherStatus.sourceDagId}}</p>
                            <p><span class='prop'>开始时间</span>:{{jobFatherStatus.execStartDate}}</p>
                            <p><span class='prop'>结束时间</span>:{{jobFatherStatus.execEndDate}}</p>
                            <p><span class='prop'>描述</span>:{{jobFatherStatus.jobReasonDesc}}</p>
                            
                            <div class="pdiv">
                              <a-button :disabled="!canRun(jobFatherStatus.jobStatus)||!canRunOrStop(jobFatherStatus.jobStatus)" class="b" type='primary' @click="onStartJobFather(jobFatherStatus.id)" >开始运行</a-button>
                              <a-button :disabled="!canStop(jobFatherStatus.jobStatus)||!canRunOrStop(jobFatherStatus.jobStatus)" class="b" type='primary' @click="onStopJobFather(jobFatherStatus.id)"  >停止运行</a-button>
                              
                
                              <a-button :disabled="!canReback(jobFatherStatus.jobStatus)" class="b" type='primary' @click="onExamineJob(jobFatherStatus.id,false,true)">撤回</a-button>
                              
                            </div>
                            <div class="pdiv">
                              <a-checkbox @change="onFatherCore" defaultChecked>作用于核心</a-checkbox>
                              <a-checkbox @change="onFatherNotCore" >作用于非核心</a-checkbox>
                            </div>
                            <div class="pdiv" v-if="mode==='admin'">
                              
                              <a-button :disabled="!canAgree(jobFatherStatus.jobStatus)" class="b" type='primary' v-if="mode"  @click="onExamineJob(jobFatherStatus.id,true,true)" >通过</a-button>
                              
                              <a-button :disabled="!canRefused(jobFatherStatus.jobStatus)" class="b" type='primary' v-if="mode"  @click="onExamineJob(jobFatherStatus.id,false,true)"  >拒绝</a-button>
                              
                            </div>
                            
                             当前任务的子任务（按照时间线）：
                             <br>
                </div>
                <br>
                <div class='timeline'>
                      
                      <a-timeline>
                       
                        <a-timeline-item v-for="d in jobStatus" :key="d.id" :color="colorId(d)">
                            <div class="pdiv">
                                <p><span class='prop'>当前状态</span>:{{d.jobStatus}}</p>
                                <p><span class='prop'>开始时间</span>:{{d.execStartDate}}</p>
                                <p><span class='prop'>结束时间</span>:{{d.execEndDate}}</p>
                            
                                
                                <p><span class='prop'>创建时间</span>:{{d.jobCreateTime}}</p>
                                <p><span class='prop'>完成时间</span>:{{d.jobFinishTime?d.jobFinishTime:'未完成'}}</p>

                                <p><span class='prop'>jobId</span>:{{d.id}}</p>
                                <div  v-for="(key,value) in subJobStatus[d.id]" :key="key+'-'+value">
                                        <p><span class='prop'>{{value}}</span>:{{key}}</p>
                                </div>
                                <p>
                                <a target="_blank" :href="'#/graph-rerun/'+d.id">查看子任务状态</a>
                                </p>
                            </div>
                            <div class="pdiv">
                              <a-button :disabled="!canRun(d.jobStatus)||!canRunOrStop(d.jobStatus)" class="b" type='primary' @click="onStartJob(d.id)">开始运行</a-button>
                              <a-button :disabled="!canStop(d.jobStatus)||!canRunOrStop(d.jobStatus)" class="b" type='primary' @click="onStopJob(d.id)">停止运行</a-button>
                              
                            </div>
                            <div class="pdiv">
                              <a-checkbox @change="(e)=>onApplyCore(e,d.id)"    >作用于核心</a-checkbox>
                              <a-checkbox @change="(e)=>onApplyNotCore(e,d.id)" >作用于非核心</a-checkbox>
                            </div>
                            <div class="pdiv" v-if="mode==='admin'">
                              
                              <a-button :disabled="!canAgree(d.jobStatus)"  class="b" type='primary' v-if="mode"  @click="onExamineSubJob(d.id,true,false)" >通过</a-button>
                              
                              <a-button :disabled="!canRefused(d.jobStatus)"  class="b" type='primary' v-if="mode"  @click="onExamineSubJob(d.id,false,false)">拒绝</a-button>
                              
                            </div>
                        </a-timeline-item>
                        
                    </a-timeline>
                </div>


                    注：此页面还在开发中，如果提交任务请联系@ranxianglei 协助提交。
                    本页面已知未实现：jobId变化后，url里面的jobId跟着变。

     </layout>         
</div>    
</template>
<script>
import _ from 'lodash'
import {axiosRequst} from '../../util/httpUtils'
import Layout from '../common/Layout'
import infiniteScroll from 'vue-infinite-scroll'


export default {
 name: 'Graph',
  components: {
      Layout,
      
  },
  directives: { infiniteScroll },
  data() {
    return {
        currentJobId:null,
        jobStatus:[],
        jobFatherStatus:null,
        subJobStatus:{},
        currentDagId:null,
        jobStatusByDag:[],
        searchVisible:false,
        nowCountDown:null,
        reflushTotalTime:30,
        mode:'normal',
        showJobStatusDetail:{},
        fatherCore:true,
        fatherNotCore:false,
        applyCore:{},
        applyNotCore:{}
        
    }
  },
  mounted() {
    if(this.$route.params.jobId){
      if(this.$route.params.mode===-1||this.$route.params.mode==='-1'){
          this.mode = 'admin'
          
          
      }
      this.currentJobId = this.$route.params.jobId
      this.queryJobs()
    }  
  },
  computed: {
      
  },
  methods: {
            
     hi(){

     }
     ,
     
     countDown(){


      if(this.nowCountDown){
        clearInterval(this.nowCountDown)
      }
      if(!this.currentJobId){
          return
      }
      let clock = setInterval(() => {
              
              if(this.reflushTotalTime==0){
                  this.queryJobs()
                  this.reflushTotalTime=30
              }
              this.reflushTotalTime--
        },1100)
        this.nowCountDown = clock
     }  
     ,   
     colorId(jobStatus){
         if(!jobStatus){
             return 'gray';
         }
         if(jobStatus.jobStatus==="执行完成"){
             return '#1890ff';
         }
         if(jobStatus.jobStatus==='等待审批'){
             return '#b58900';
         }
         if(jobStatus.jobStatus==="初始化失败"){
            return '#f5222d';
         }
         if(jobStatus.jobStatus==="初始化成功"){
            return '#ffbf00	';
         }
         if(jobStatus.jobStatus==="正在运行"){
            return '#52c41a';
         }
         if(jobStatus.jobStatus==="待运行"){
            return '#00ffbf';
         }
         return '#9d8128';

     }
    ,
    canRunOrStop(jobStatus){
        
        if(jobStatus==='待运行'){
            return true;
        }
        if(jobStatus==='初始化成功'){
            return true;
        }
        if(jobStatus==='正在运行'){
            return true;
        }
        return false;
    }
    ,
    canRun(jobStatus){
        if(jobStatus==='待运行'){
            return true;
        }
        if(jobStatus==='初始化成功'){
            return true;
        }
        if(jobStatus==='正在运行'){
            return true;
        }
        return false;
    }
    ,
    canStop(jobStatus){
        
        if(jobStatus==='正在运行'){
            return true;
        }
        if(jobStatus==='待运行'){
            return true;
        }
        return false;
    }
    ,
    canRefused(jobStatus){
        if(jobStatus==='审核失败'){
            return false;
        }
        return true;
    }
    ,
    canAgree(jobStatus){
        if(jobStatus==='等待审批'){
            return true;
        }
        if(jobStatus==='审核失败'){
            return true;
        }
        return false;
    }
    ,
    canReback(jobStatus){
        if(jobStatus==='等待审批'){
            return true;
        }
        return false;
    }
    ,
    onFatherCore(value){
        if(value)  this.fatherCore = value.target.checked
    }
    ,
    onFatherNotCore(value){
        if(value)  this.fatherNotCore = value.target.checked
    }
    ,
    onApplyCore(value,jobId){
        if(value)  {
            this.applyCore[jobId] = value.target.checked
        }

    }
    ,
    onApplyNotCore(value,jobId){
        if(value)  {
            this.applyNotCore[jobId] = value.target.checked
        }
    }
    ,
     onJobId(value){
         if(value){
            
             let currentJobId = Number.parseInt(value.target.value) 
             if(currentJobId){
                 this.currentJobId = currentJobId
                 this.queryJobs()
             }
         }
     }
     ,onDagId(value){
        if(value){
            this.currentDagId = value.target.value
            this.queryJobsByDag(this.currentDagId) 
        }
     },
     lookupDetail(jobId){
         this.currentJobId = jobId
         this.queryJobs()
     }
     ,queryJobs(){
        window.t = this;
        if(this.currentJobId){
            this.countDown()

            axiosRequst({
                    path: '/data/back/show/father',
                    params: {
                    jobId:this.currentJobId
                    },
                    type:'post'
            }).then(data=>{
                let dags =  _.get(data,'data.data');
                if(dags){
                  this.jobFatherStatus = dags.filter(d=> {if(d.jobFather){return false} else {return true}})[0]
                  this.jobStatus= dags.filter(d=> {
                      if(d.jobFather){
                            return true
                      } else {
                            return false  
                   }})

                   Promise.all(this.jobStatus.map(job=>{
                       return this.querySubJobStatus(job.id,false)
                   })).then(()=>{
                       this.jobStatus=this.jobStatus.slice()
                   })
                   
                }
            })
        }
    }
    
     ,queryJob(jobId){
        if(jobId){

            axiosRequst({
                    path: '/data/back/show/job',
                    params: {
                    jobId:jobId
                    },
                    type:'post'
            }).then(data=>{
                let dags =  _.get(data,'data.data');
                if(dags){
                   if(this.jobStatus){
                        for(let i = 0 ;i<this.jobStatus.length;i++){
                            if(this.jobStatus[i].id===jobId){
                                this.jobStatus[i]=dags
                            }
                        }
                        this.jobStatus=this.jobStatus.slice()                        
                    
                    }
                   
                }
            })
        }
    }
    ,queryJobsByDag(dagId){
        if(!dagId){
            return ;
        }
        axiosRequst({
                path: '/data/back/show/father/by/dag',
                params: {
                 dagId
                },
                type:'post'
        }).then(data=>{
            let dags =  _.get(data,'data.data');
            if(dags){
                console.log(dags,'queryJobsByDag')
                this.jobStatusByDag=dags;
            }
        })
        
    }
    
    ,
    querySubJobStatus(jobId,reflushAll){
      
      if(jobId){
        return axiosRequst({
                path: '/data/back/query/job/status',
                params: {
                  jobId:jobId,
                
                },
                type:'get'
        }).then(data=>{
            let status =  _.get(data,'data.data');
            if(status){
               this.subJobStatus[jobId]=status
                if(reflushAll){
                   this.jobStatus=this.jobStatus.slice()
                }
               
            }
            
        })
      }
    }
    ,
    onStartJobFather(jobId){
        this.startJobFather(jobId,()=>{
            this.startJob(jobId,()=>{
                this.queryJobs()
            })
        })
    }
    ,
    onStopJobFather(jobId){
        this.stopJobFather(jobId,()=>{
            this.stopJob(jobId,()=>{
                this.queryJobs()
            })
        })
    }
    ,
    onStartJob(jobId){
        this.startJob(jobId,()=>{
            this.querySubJobStatus(jobId,true)
            this.queryJob(jobId)
        })
    }
    ,
   onStopJob(jobId){
        this.stopJob(jobId,()=>{
            this.querySubJobStatus(jobId,true)
            this.queryJob(jobId)
        })
    }
    ,
    startJob(jobId,thenDo){
      
      if(jobId){
        axiosRequst({
                path: '/data/back/start/job',
                params: {
                  jobId:jobId,
                  isCore:(this.applyCore[jobId]&&this.applyNotCore[jobId])?null:((!this.applyCore[jobId]&&!this.applyNotCore[jobId])?null: (this.applyCore[jobId]?true:false))
                },
                type:'post'
        }).then(data=>{
            let status =  _.get(data,'data.data');
            if(status){
               this.$message.info("成功开始运行job:"+jobId)
            }
            if(thenDo){
                thenDo()
            }
            
        })
      }
    }
    ,
    stopJob(jobId,thenDo){
      
      if(jobId){
        axiosRequst({
                path: '/data/back/stop/job',
                params: {
                  jobId:jobId,
                  isCore:(this.applyCore[jobId]&&this.applyNotCore[jobId])?null:((!this.applyCore[jobId]&&!this.applyNotCore[jobId])?null: (this.applyCore[jobId]?true:false))
                },
                type:'post'
        }).then(data=>{
            let status =  _.get(data,'data.data');
            if(status){
               this.$message.info("正在异步停止job:"+jobId)
            }
            if(thenDo){
                thenDo()
            }
            
        })
      }
    }
    ,
    startJobFather(jobId,thenDo){
      
      if(jobId){
        axiosRequst({
                path: '/data/back/start/job/father',
                params: {
                  jobId:jobId,
                  isCore:(this.fatherCore&&this.fatherNotCore)?null:((!this.fatherCore&&!this.fatherNotCore)?null: (this.fatherCore?true:false))
                },
                type:'post'
        }).then(data=>{
            let status =  _.get(data,'data.data');
            if(status){
               this.$message.info("成功开始运行job:"+jobId)
            }
            if(thenDo){
                thenDo()
            }
        })
      }
    }
    ,
    stopJobFather(jobId,thenDo){
      
      if(jobId){
        axiosRequst({
                path: '/data/back/stop/job/father',
                params: {
                  jobId:jobId,
                  isCore:(this.fatherCore&&this.fatherNotCore)?null:((!this.fatherCore&&!this.fatherNotCore)?null: (this.fatherCore?true:false))

                },
                type:'post'
        }).then(data=>{
            let status =  _.get(data,'data.data');
            if(status){
               this.$message.info("正在异步停止job:"+jobId+'的子任务')
            }
            if(thenDo){
                thenDo()
            }
        })
      }
    }
    ,
    onExamineJob(jobId,isAgree,isFather){
        this.examineJob(jobId,isAgree,isFather,()=>{
            this.queryJobs()
        })
    }
   ,
    onExamineSubJob(jobId,isAgree,isFather){
        this.examineJob(jobId,isAgree,false,()=>{
            this.querySubJobStatus(jobId,true)
            this.queryJob(jobId)
        })
    }
   ,
   examineJob(jobId,isAgree,isFather,thenDo){
      
      if(jobId){
        axiosRequst({
                path: '/data/back/examine/job',
                params: {
                  jobId:jobId,
                  isAgree:isAgree?true:false,
                  isFather:isFather?true:false,
                },
                type:'get'
        }).then(data=>{
            let status =  _.get(data,'data.data');
            if(status){
               this.$message.info("操作成功")
            }
            if(thenDo){
                thenDo()
            }
        })
      }
    }
    ,
  },
}

</script>


<style lang="scss">


.prop{
    font-weight: bold
}
.demo-infinite-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: auto;
  padding: 8px 24px;
  height: 300px;
}
.demo-loading-container {
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
}
.pdiv{
    padding:3px;
    button{
        margin:3px;
    }
}
</style>