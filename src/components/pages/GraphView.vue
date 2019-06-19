<template>
<div>
            <CommonGraph ref="commonGraph" >

             <template slot="header">

                


                <slot name="moreButton"></slot>
                <a-button class="buttonItem" :disabled="!currentClicked"  type="primary" @click="lookupUpstream" :loading="showUpstreamPending" >显示节点上游</a-button>
                <a-button class="buttonItem" :disabled="!currentClicked" type="primary" @click="lookupDownstream" :loading="showDownstreamPending" >显示节点下游</a-button>
                <a-button class="buttonItem" :disabled="!currentClicked"  type="primary" @click="lookupKeyPath" :loading="showKeyPathPending" >显示关键路径</a-button>
                <a-button class="buttonItem" :disabled="!currentSelected || currentSelected.length<2"  type="primary" @click="lookupPath" :loading="showPathPending" >显示两点之间路径</a-button>
                <div style="display:'inline-block'">
                    <a-popover
                      title="查找"
                      trigger="click"
                      placement="bottomLeft"
                      v-model="findVisible"
                      
                    >
                
                         <a-button class="buttonItem"  type="primary"  > 查找 </a-button>
                        <template slot="content">
                              <!--
                              <a-select
                                showSearch
                                :value="searchTableValue"
                                placeholder="input search text"
                                style="width: 500px"
                                :defaultActiveFirstOption="false"
                                :showArrow="false"
                                :filterOption="false"
                                @search="handleSearchTable"
                                @change="handleChangeTable"
                                :notFoundContent="null"
                              >
                                <a-select-option v-for="d in searchTableData" :key="d">{{d}}</a-select-option>
                              </a-select>
                              -->
                              <slot name="searchTable"></slot>

                              
                              <br/>
                              <a-radio-group :value="computedSearchGroups&&searchTarget"  :defaultValue="searchTarget" @change="searchTargetChange" buttonStyle="solid">
                              
                                <a-radio-button value="keyPath">关键路径</a-radio-button>
                                <a-radio-button value="keyPathOnly">关键路径Only</a-radio-button>

                                <a-radio-button value="upstream">上游</a-radio-button>
                                <a-radio-button value="downstream">下游</a-radio-button>
                              </a-radio-group>
                              <br/>
                              <br/>

                              <a-button icon="search" @click="showEvent" :loading="searching">Search</a-button>

                        </template>
                   </a-popover>
                </div>
              <a-button class="buttonItem"  type="primary" @click="reset" >重置画布</a-button>
            </template>
              
            <template slot="status">
                <div v-draggable="draggableValue" style="z-index:3;background: white;"  class="draggableTarget" title="可拖动">
                    <div :ref="handleId" >
                      <div   alt="move" style="user-select: text">
                        <a-table :title="helloWorld" :columns="toKeys(currentShowData)" :dataSource="currentShowData===null?[]:toValue(currentShowData)"
                          :scroll="{ x:300,y:800}" :pagination="false" style="word-wrap:break-word;word-break:breal-all;" :showHeader="false"
                        >
                         
                        </a-table>
                        </div>
                    </div>    
                </div>
              

       

                  <!---
                  <a-card    :bodyStyle="{padding:'0px',height: '50px' }"
                              :hoverable="false"
                              v-if="Object.keys(currentShowData===null?{}:currentShowData).length<=1"
                              class="card-warpper">
                        <div class="cardItem" >
                          <div v-for="key in Object.keys(currentShowData===null?{}:takeFirst(currentShowData))"
                              :key="key"
                              class="item">
                            <div class="value"><font style="font-weight: bold">{{ key }}</font>: {{ takeFirst(currentShowData)[key] }}</div>

                          </div>
                        </div>
                  </a-card>
                  -->
            </template>
         </CommonGraph>
</div>
</template>

<script>
import CommonGraph from '../common/CommonGraph'
import {axiosRequst,setErrorHandle} from '../../util/httpUtils'
import _ from 'lodash'
// import draggable from 'vuedraggable'
  import { Draggable } from 'draggable-vue-directive'



console.log("setErrorHandle",setErrorHandle)
export default {
  name: 'GraphView',
  components: {
    CommonGraph,
    Draggable
  },
  props:{
      
      showUpstreamAPI:{
          type:[Function],

          default:(value)=>{
              return {
                path: '/internal/dg/findwhyslow/graph/table/upstream2',
                params: {
                    table:value,
                    pDate:"20190610",
                },
                type:'get'
              }
          }
      },
      showDownstreamAPI:{
          type:[Function],

          default:(value)=>{
              return {
                path: '/internal/dg/findwhyslow/graph/table/downstream2',
                params: {
                    table:value,
                    pDate:"20190610",

                },
                type:'get'
              }
          }
      },
      showPathAPI:{
          type:[Function],

          default:(v1,v2)=>{
              return {
                path: '/internal/dg/findwhyslow/graph/table/path',
                params: {
                    table:v1,
                    table2:v2,
                     pDate:"20190610",
                   
                } ,
                type:'get'
             }
          }
      },
      showKeyPathAPI:{
          type:[Function],
          
          default:(v,keyPathOnly)=>{
              return [{
                path: '/internal/dg/findwhyslow/graph/table/keypath2',
                params: {
                    table:v,
                    keyPathOnly,
                    pDate:"20190610",
                    
                },
                type:'get',
                groupId:"20190610",
             }]
          }
      },
      handleStr2Obj:{
          type:[Function],
          default:(v)=>{
            if(!v){
                return {}
            }else{
                let arr=v.str.split(".")
                return {
                    dbName:arr[0],
                    tbName:arr[1]
                }
            }
        }
      },
      handleDescProps:{
          type:[Function],
          default:(prop)=>{
              return {
                "库名":prop["dbName"],
                "表名":prop["tbName"],
                "关键路径":prop["keyPath"]
             }
          }
      },
      
      handleDescPropsE:{
          type:[Function],
          default:(prop)=>{
              return {
                
             }
          }
      },
      searchTableData:{
          type:[Array],
          default: ()=>{
              return ["累计DAU_0201使用.5206"]
          }
      },
      searchTableValue:{
        type:[String],
        default: ()=>null,
      }
      ,
      handle2StdV:{
        type:[Function],
        default:(v)=>{
          return v;
        }
      },
      handle2StdE:{
        type:[Function],
        default:(e)=>{
          return e;
        }
      },
      addOtherListen:{
        type:[Function],
        default:()=>{}
      },
      searchTableDefault:{
        type:[String],
        default:()=>{
          return null;
        }
      },
      searchGroups:{
        type:[Array],
        default:()=>{
          return []
        }
      }

  },
  created() {
      this.setErrorHandle((error)=>{
         console.log("error from message",error)
         if(error&&error.response&&error.response.data){
             this.$message.error("error: response code is "+error.response.status+"."+error.response.data)
         }
         
      })
  }
  ,
  mounted() {
    this.draggableValue.handle = this.$refs[this.handleId];
  }
  ,
  directives: {
      Draggable,
  },
  
  data(){
    return {
        registerVGroup:{},
        registerV:{},
        registerVCnt:0,
        searching:false,
        searchedList:{},
        lookupList:{},
        // searchTableValue:null,
        registerProps:{},
        registerEProps:{},
        searchTarget: (this.searchGroups.length>1)?'keyPathOnly':'keyPath',
        currentSelected:null,
        currentClicked:null,
        currentHover:null,
        currentHoverE:null,
        currentShowData:null,
        setErrorHandle:setErrorHandle,
        showKeyPathPending:false,
        showPathPending:false,
        showDownstreamPending:false,
        showUpstreamPending:false,
        hmSelect:false,
        handleId: "handle-id",
        draggableValue: { },
        tableDirection:"|",
        findVisible:true,
       



    }
  },
  computed: {
    computedSearchGroups(){
      this.searchTarget =  (this.searchGroups.length>1)?'keyPathOnly':'keyPath'
      return true;
    }
  }
  ,
  methods: {
    reset(){
        this.$refs.commonGraph.clearAll()
        this.registerV={}
        this.registerVCnt=0;
        this.searching=false;
        this.searchedList = {};
        // this.searchTableValue=null;
        // todo key是点v，目前value是{... prop}
        // todo value改成object { 组别:prop }
        this.registerProps={};
        this.currentSelected = null;
        this.currentClicked = null;
        this.currentHover = null;
        this.lookupList={};
        this.currentShowData = null
        this.hmSelect =false;
        this.computedSearchGroups;
    }


  ,
  helloWorld(){}
  ,
  takeFirst(obj){
    if(obj){
      let res = obj[Object.keys(obj)[0]]
      return res;
    }
  }
  ,
  toValueUpRight(obj){
    if(!obj){
      return [];
    }
      let arr=[]
      if(obj){
        for(let j = 0;j<Object.keys(obj).length;j++){
          let props = obj[Object.keys(obj)[j]];
          
          for(let i=0;i<Object.keys(props).length;i++){
            let title = Object.keys(props)[i];
            
            
            if(!arr[i]){
                arr[i]={key:title}
            }            
            arr[i]['value'+j] = props[Object.keys(props)[i]];            
          }
        }

      }
      return arr;
  }
  ,
  toKeyUpRight(obj){
    if(!obj)
      return [];
    let arr=[]
    arr.push({title:'key',dataIndex:'key'})

    for(let i = 0;i<Object.keys(obj).length;i++){
        arr.push({title:"value"+i,dataIndex:"value"+i,width:150 })       
    }
    return arr;
  }
  ,
  toValue(obj){
    
      if(obj){
        if(this.tableDirection==='|'){
          return this.toValueUpRight(obj)
        }
        let arr=[]
        Object.keys(obj).forEach(k=>{
          
          arr.push(obj[k])
        })
        return arr;
      }
  }
  ,
    toKeys(obj){
      if(this.tableDirection==='|'){
        return this.toKeyUpRight(obj)
      }
      let has={}
      let coloms = []
      if(obj){
        
        Object.keys(obj).forEach(k=>{
            Object.keys(obj[k]).forEach(tk=>{
              if(!has[tk]){
                 coloms.push({title:tk,dataIndex:tk,width:150})
                 has[tk]=true;
              }else{

              }
                
            })  
        })
        
      }
      return coloms
  }
  ,
    handleHotUpdateV(v,prop){
        if(!v || !prop){
          return 
        }


        let p = this.registerProps[v]
        if(!p){
          this.registerProps[v] = {}
          p = this.registerProps[v]
        }
        Object.keys(prop).forEach(k=>{
          p[k] = prop[k]
        })
        this.registerProps[v] = p;
        let theV = this.dealV(v,true);
        this.$refs.commonGraph.network.nodes.update(theV)
    }
    ,

    searchTargetChange(value){
      console.log(this.searchGroups,'searchGroups')
        if(value&&value.target.value){
          this.hmSelect = true;
          this.searchTarget = value.target.value
        }
    },

  getId(v){
      if(!this.registerV[v.str]){
          this.register(v)
      }
      return this.registerV[v.str]
  }
  ,
  register(v){
      if(!this.registerV[v.str]){
          this.registerV[v.str] = this.registerVCnt;
          this.registerVCnt = this.registerVCnt+1;
         
      }
      if(!this.registerVGroup[v.str]){
          this.registerVGroup[v.str]=[]
      }
      this.registerVGroup[v.str].push(v.groupId)
  },
  
  str2Obj(v){
    return this.handleStr2Obj(v);
  }

  ,
  /**
    {groupId:{prop}}
   */
  descProps(prop){
    return this.handleDescProps(prop)
  }
  ,
  descPropsE(prop){
    return this.handleDescPropsE(prop)
  }
  ,
  /**
  这个的v，可能没有group
   */
  convertToProps(v,prop,origin){
    let ob = null;
    if(!v){
      ob = {}
    }else{
      if(!origin){
         ob = this.str2Obj(v);
      }else{
         ob = v;
      }
      
    }
    let res = {}

    if(prop){
      Object.keys(prop).forEach(group=>{
         if(!res[group]){
           res[group] = {
             ... ob
           }
         }
         
         Object.keys(prop[group]).forEach(p=>{
              res[group][p]=prop[group][p]
         })
      })
    }
    return res;
  }
  ,


  convertToTableTitle(ob){
      let title = "多个数据：<br/>"
      Object.keys(ob).forEach(k=>{
        title+=k+"<br>"
      })
      return title;
  }
  ,
  /**
    v with group
    prop with group
   */
  convertToTitle(v,prop){
    let ob = this.descProps(this.convertToProps(this.normalStr2Obj(v),prop))
    let title = "";
    if(Object.keys(ob).length==1){
      ob = ob[Object.keys(ob)[0]]
      Object.keys(ob).forEach(k=>{
          title=title+k+":"+(ob[k]===undefined?"":ob[k])+"<br/>";
      })
    }else{
      title=this.convertToTableTitle(ob)
    }

    
    return title;
  }
  ,
  dealColor(v){
    
    if(this.searchedList){
      if(this.searchedList[v.str]){
        return "lime";
      }
    }

    if(this.lookupList){
      if(this.lookupList[v.str]){
        return "#00ffff";
      }
    }

    const prop = this.registerProps[v.str];
    if(prop){
      let keypath=false
      
      Object.keys(prop).forEach(group=>{
        if(prop[group]["keyPath"]){
            keypath=true
        }
      })
      if(keypath){
        return "#859900";
      }
    }
  }
  ,
  convertToLabel(v,prop){
    let ob = this.descProps(this.convertToProps(this.normalStr2Obj(v),prop))
    let label = "";
    label+=this.getId(v)
    
    // if(Object.keys(ob).length>1){
      label+="\n"
      Object.keys(ob).forEach(k=>{
        label+=k+"\n"
      })
    // }

    
    return label;
  },
   dealV (tv,origin){
      let v = null ;
      if(!origin){
          v = this.handle2StdV(tv)
          v["groupId"] = tv.groupId;
      }else{
        v = tv;
      }
      
      this.register(v)
      const prop = this.registerProps[v.str];
      console.log("convertToTitle",v)
      let title = this.convertToTitle(v,prop)
      
      return {
            id:v.str
        ,label:this.convertToLabel(v,prop)
        ,color:this.dealColor(v)
        ,title:title
       , shape: 'ellipse'
      }
    },

    dealE (te){
      const e = this.handle2StdE(te)
      return {
        id:   e.source+"->"+e.dest, 
        from: e.source,
        to:   e.dest
      }
    },
    // TODO change to update mode from replace mode
    // TODO 这个地方的props存储方式，变成按照分组存储
    registerTheProps(data){
        let props = _.get(data,'data.data.props')
        if(props){
          Object.keys(props).forEach((prop)=>{
            if(!this.registerProps[prop]){
                this.registerProps[prop]={}
            }
            this.registerProps[prop][data.args.groupId] = props[prop];
          })
        }
    } 
    ,registerTheEProps(data){
        let props = _.get(data,'data.data.propsE')
        if(props){
          Object.keys(props).forEach((prop)=>{
            if(!this.registerEProps[prop]){
              this.registerEProps[prop]={}
            }
            this.registerEProps[prop][data.args.groupId]= props[prop]
          })
        }
    },
    normalStr2Obj(str){
        if(!str){
          return {str:""}
        }
        if(typeof str === "string")
          return {str:str}
        return str;
    }
    ,  
    registerGroupToVE(list,groupId){
        if(list){
          for(let i=0;i<list.length;i++){
             if(typeof list[i]==="string"){
               list[i]=this.normalStr2Obj(list[i])
             }
             list[i].groupId = groupId;
          }
        }
    } , 
    renderTheGraph(data,mode,focus){
        let graph = _.get(data,'data.data.graph');
        if(graph&&this.$refs.commonGraph){
            if(graph.v.length===0){
              this.$message.info("无数据")
            }
            this.registerGroupToVE(graph.v,data.args.groupId)
            this.registerGroupToVE(graph.ve,data.args.groupId)
            this.$refs.commonGraph.update({
                v:graph.v,
                e:graph.e,
            },mode,this.dealV,this.dealE,focus)
            this.addSelectListen()
            this.addOtherListen()
        }
    }
    
    ,getNetwork(){
        return this.$refs.commonGraph.getNetwork();
    },
    addSelectListen(){
        this.$refs.commonGraph.getNetwork().on('click',(parms)=>{
          if(parms&&parms.nodes&&parms.nodes.length>0){
            const v = parms.nodes[0];
            if(v){
              this.currentClicked = v;
              
              const prop = this.registerProps[v];
              let nv = this.normalStr2Obj(v)

              this.currentShowData = this.descProps(this.convertToProps(nv,prop))
            }
            this.currentSelected = parms.nodes;
          }else{
            // this.currentSelected = null;
            // this.currentClicked = null;
            // this.currentShowData = null;
            // this.currentHover = null;
          }
        })

        this.$refs.commonGraph.getNetwork().on('hoverEdge',(e)=>{
            console.log('hoverEdge',e)
            let edge = e.edge
            let isUpdated = false;
            if(edge){
                
              const prop = this.registerEProps[edge];
              if(prop){
                this.currentHoverE = edge;
                this.currentHover = edge;

                // let nv = this.normalStr2Obj(v)
                let pairs = edge.split('->')
                let upstream = pairs[0];
                let downstream = pairs[1];
                
                let up = this.str2Obj(this.normalStr2Obj(upstream))
                Object.keys(up).forEach(k=>{
                  up['up_'+k] = up[k]
                  up[k]=undefined;
                })
                let down = this.str2Obj(this.normalStr2Obj(downstream))
                Object.keys(down).forEach(k=>{
                  down['down_'+k] = down[k]
                  down[k]=undefined;
                })
                
                this.currentShowData = this.descPropsE(this.convertToProps(Object.assign({},up,down),prop,true))
                isUpdated=true
              }
            }
            if(!isUpdated&&this.currentHoverE){
              this.currentShowData = null;
              this.currentHoverE = null;
            }
        })

        this.$refs.commonGraph.getNetwork().on('showPopup',(v)=>{
            if(v){
              this.currentHover = v;
                
              const prop = this.registerProps[v];
                
              let nv = this.normalStr2Obj(v)

              this.currentShowData = this.descProps(this.convertToProps(nv,prop))
            }
        })
    } ,
      
    
     dealResponse(data,mode,focus){
       console.log("dealResponse",data)
        if(!mode){
          mode = 'add'
        }
        this.registerTheProps(data)
        this.registerTheEProps(data)
        this.renderTheGraph(data,mode,focus)
        
        this.$message.info('查询结果已经返回',1);
    }

    ,lookupUpstream(){
        if(this.currentClicked){
          this.lookupList[this.currentClicked]=true;
          this.showUpstream(this.currentClicked)
        }
    }
    ,lookupDownstream(){
        if(this.currentClicked){
            this.lookupList[this.currentClicked]=true;
           this.showDownstream(this.currentClicked)
        }
    }
   ,lookupKeyPath(){
        if(this.currentClicked){
          this.lookupList[this.currentClicked]=true;
           this.showKeyPath(this.currentClicked)
        }
    }
    ,
    lookupPath(){
      if(this.currentSelected&&this.currentSelected.length>=2){
         this.lookupList[this.currentSelected[0]] = true; 
         this.lookupList[this.currentSelected[1]] = true; 
         this.showPath(this.currentSelected[0],this.currentSelected[1])
      }
    }
    ,showEvent(){
      console.log("searchTarget",this.searchTarget)
      if(this.searchTableValue&&this.searchTableData&&this.searchTableData.includes(this.searchTableValue)){
        const value = this.searchTableValue;
        this.searchedList[value]=true
        
        // if(this.searchTarget==="keyPathOnly"||this.searchTarget==="keyPath"){

        // }

        if(this.searchTarget==="keyPathOnly"){
            this.showKeyPath(value,true)
        }else if(this.searchTarget==="keyPath"){
            this.showKeyPath(value,false)
        }else if(this.searchTarget==="upstream"){
            this.showUpstream(value)
        }else if(this.searchTarget==="downstream"){
            this.showDownstream(value)
        }
      }
    }

        // showKeyPathPending:false,
        // showPathPending:false,
        // showDownstreamPending:false,
        // showUpstreamPending:false


    ,showUpstream(value){
      if(value){
           this.$message.info('此查询可能较慢，请耐心等待',1);
            this.searching = true
            this.showUpstreamPending=true
            Promise.all(this.showUpstreamAPI(value)
              .map(arg=>axiosRequst(arg).then(this.dealResponse) ))
            .then(()=>{
                 this.searching = false
                 this.showUpstreamPending=false
            })
      }
    }
    ,showDownstream(value){
      if(value){
            this.$message.info('此查询可能较慢，请耐心等待',1);
            this.showDownstreamPending = true
            this.searching = true
            Promise.all(this.showDownstreamAPI(value).map(arg=>{
              axiosRequst(arg).then(this.dealResponse)
            })).then(()=>{
              this.searching = false
              this.showDownstreamPending =false
            })
      }
    }
    ,showPath(value1,value2){
      if(value1&&value2){
        this.showPathPending = true
        Promise.all(
           this.showPathAPI(value1,value2).map((arg)=>{
                    axiosRequst(arg).then(this.dealResponse)
           })
        ).then(()=>{
          this.showPathPending=false
        })
      }
    }
    ,showKeyPath(value,keyPathOnly){
      if(value){
        this.$message.info('此查询可能较慢，请耐心等待',1);
        this.showKeyPathPending = true
        this.searching = true
        // TODO 这个地方的参数由一个变成多个，传入一个map，一个key对应一个参数
        const showkeypathArgs = this.showKeyPathAPI(value,keyPathOnly)
        console.log("showkeypathArgs ",showkeypathArgs)
        Promise.all(showkeypathArgs.map(arg=>{
          return axiosRequst(arg).then(this.dealResponse)
        })).then(()=>{
             this.searching = false
             this.showKeyPathPending=false
        })

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
  .draggableTarget:hover{

  }
}

</style>
