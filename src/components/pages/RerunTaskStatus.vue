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
                            <p><span class='prop'>clusterId</span>:{{jobFatherStatus.sourceClusterId}}</p>
                            <p><span class='prop'>dagId</span>:{{jobFatherStatus.sourceDagId}}</p>
                            <p><span class='prop'>开始时间</span>:{{jobFatherStatus.execStartDate}}</p>
                            <p><span class='prop'>结束时间</span>:{{jobFatherStatus.execEndDate}}</p>
                            <p><span class='prop'>描述</span>:{{jobFatherStatus.jobReasonDesc}}</p>

                             当前任务的子任务（按照时间线）：
                             <br>
                </div>
                <br>
                <div class='timeline'>
                      
                      <a-timeline>
                       
                        <a-timeline-item v-for="d in jobStatus" :key="d.id" :color="colorId(d)">
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
                        </a-timeline-item>
                        
                    </a-timeline>
                </div>


                    注：此页面还在开发中，如果提交任务请联系@ranxianglei 协助提交

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
    }
  },
  mounted() {
    if(this.$route.params.jobId){
      this.currentJobId = this.$route.params.jobId
      this.queryJobs()
    }  
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
            return '#52c41a';
         }
         return '#9d8128';

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
                   this.jobStatus.forEach(job=>{
                       this.querySubJobStatus(job.id)
                   })
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
    querySubJobStatus(jobId){
      
      if(jobId){
        axiosRequst({
                path: '/data/back/query/job/status',
                params: {
                  jobId:jobId,
                
                },
                type:'get'
        }).then(data=>{
            let status =  _.get(data,'data.data');
            if(status){
               this.subJobStatus[jobId]=status
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

</style>