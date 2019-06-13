<template>
<div>
            <CommonGraph ref="commonGraph" >

             <template slot="header">
                <slot name="moreButton"></slot>
                <a-button class="buttonItem" :disabled="!currentClicked"  type="primary" @click="lookupUpstream" >显示节点上游</a-button>
                <a-button class="buttonItem" :disabled="!currentClicked" type="primary" @click="lookupDownstream" >显示节点下游</a-button>
                <a-button class="buttonItem" :disabled="!currentClicked"  type="primary" @click="lookupKeyPath" >显示关键路径</a-button>
                <a-button class="buttonItem" :disabled="!currentSelected || currentSelected.length<2"  type="primary" @click="lookupPath" >显示两点之间路径</a-button>
                <div style="display:'inline-block'">
                    <a-popover
                      title="查找"
                      trigger="click"
                      placement="bottomLeft"
                      
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
                              <br/>
                              <a-radio-group defaultValue="keyPath" @change="searchTargetChange" buttonStyle="solid">
                              
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
                  <a-card  v-if="currentClicked"   :bodyStyle="{padding:'3px'}"
                              :hoverable="true"
                              class="card-warpper">
                        <div class="cardItem">
                          <div v-for="key in Object.keys(currentShowData===null?{}:currentShowData)"
                              :key="key"
                              class="item">
                            <div class="value"><font style="font-weight: bold">{{ key }}</font>: {{ currentShowData[key] }}</div>

                          </div>
                        </div>
                  </a-card>
            </template>
         </CommonGraph>
</div>
</template>

<script>
import CommonGraph from '../common/CommonGraph'
import axiosRequst from '../../util/httpUtils'
import _ from 'lodash'


export default {
  name: 'GraphView',
  components: {
    CommonGraph
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
              return {
                path: '/internal/dg/findwhyslow/graph/table/keypath2',
                params: {
                    table:v,
                    keyPathOnly,
                    pDate:"20190610",
                    
                },
                type:'get'
             }
          }
      },
      handleStr2Obj:{
          type:[Function],
          default:(v)=>{
            if(!v){
                return {}
            }else{
                let arr=v.split(".")
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
      
      searchTableData:{
          type:[Array],
          default: ()=>{
              return ["累计DAU_0201使用.5206"]
          }
      },
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
      }
  },

  data(){
    return {
        registerV:{},
        registerVCnt:0,
        searching:false,
        searchedList:{},
        lookupList:{},
        searchTableValue:null,
        registerProps:{},
        searchTarget:"keyPath",
        currentSelected:null,
        currentClicked:null,
        currentShowData:null,
    }
  },
  methods: {
    reset(){
        this.$refs.commonGraph.clearAll()
        this.registerV={}
        this.registerVCnt=0;
        this.searching=false;
        this.searchedList = {};
        this.searchTableValue=null;
        this.registerProps={};
        this.currentSelected = null;
        this.currentClicked = null;
        this.lookupList={};
        this.currentShowData = null
    },
    searchTargetChange(value){
        if(value&&value.target.value){
          this.searchTarget = value.target.value
        }
    },

  getId(v){
      if(!this.registerV[v]){
          this.register(v)
      }
      return this.registerV[v]
  }
  ,
  register(v){
      if(!this.registerV[v]){
          this.registerV[v] = this.registerVCnt;
          this.registerVCnt = this.registerVCnt+1;
      }
  },
  
  str2Obj(v){
    return this.handleStr2Obj(v);
  }

  ,
  descProps(prop){
    return this.handleDescProps(prop)
  }
  ,
  convertToProps(v,prop){
    const ob = this.str2Obj(v);
    let res = {
      ... ob 
    }
    
    if(prop){
      Object.keys(prop).forEach(k=>{
         res[k]=prop[k]
      })
    }
    return res;
  }
  ,

  convertToTitle(v,prop){
    const ob = this.descProps(this.convertToProps(v,prop))
    let title = "";
    Object.keys(ob).forEach(k=>{
        title=title+k+":"+(ob[k]===undefined?"":ob[k])+"<br/>";
    })
    
    return title;
  }
  ,
  dealColor(v){

    if(this.searchedList){
      if(this.searchedList[v]){
        return "lime";
      }
    }

    if(this.lookupList){
      if(this.lookupList[v]){
        return "#00ffff";
      }
    }

    const prop = this.registerProps[v];
    if(prop){
      if(prop["keyPath"]){
        return "#859900";
      }
    }
  }
  ,
   dealV (tv){
      const v = this.handle2StdV(tv)
      this.register(v)
      const prop = this.registerProps[v];
      let title = this.convertToTitle(v,prop)
      
      return {
            id:v
        ,label:this.getId(v)+"" 
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
    registerTheProps(data){
        let props = _.get(data,'data.data.props')
        if(props){
          Object.keys(props).forEach((prop)=>{
            this.registerProps[prop] = props[prop];
          })
        }
    } ,    
    renderTheGraph(data,mode,focus){
        let graph = _.get(data,'data.data.graph');
        if(graph&&this.$refs.commonGraph){
            this.$refs.commonGraph.update({
                v:graph.v,
                e:graph.e,
            },mode,this.dealV,this.dealE,focus)
            this.addSelectListen()
        }
    }
    ,
    addSelectListen(){
        this.$refs.commonGraph.getNetwork().on('click',(parms)=>{
          if(parms&&parms.nodes&&parms.nodes.length>0){
            const v = parms.nodes[0];
            if(v){
              this.currentClicked = v;
              
              const prop = this.registerProps[v];
              
              this.currentShowData = this.descProps(this.convertToProps(v,prop))
            }
            this.currentSelected = parms.nodes;
          }else{
            this.currentSelected = null;
            this.currentClicked = null;
            this.currentShowData = null;
          }
        })
    } ,  
     dealResponse(data,thenDo,mode,focus){
        if(!mode){
          mode = 'add'
        }
        this.registerTheProps(data)
        this.renderTheGraph(data,mode,focus)
        if(thenDo){
          thenDo()
        }
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
      if(this.searchTableData&&this.searchTableData.length==1){
        const value = this.searchTableData[0]
        this.searchedList[value]=true
        
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
    ,showUpstream(value){
      if(value){
            this.searching = true
            axiosRequst(this.showUpstreamAPI(value)).then((data)=>this.dealResponse(data,()=>{
            this.searching = false
            }))
      }
    }
    ,showDownstream(value){
      if(value){
            this.searching = true
            axiosRequst(this.showDownstreamAPI(value)).then((data)=>this.dealResponse(data,()=>{
            this.searching = false
            }))
      }
    }
    ,showPath(value1,value2){
      if(value1&&value2){
        axiosRequst(this.showPathAPI(value1,value2)).then((data)=>this.dealResponse(data,()=>{
        }))
      }
    }
    ,showKeyPath(value,keyPathOnly){
      if(value){
        this.searching = true
        axiosRequst(this.showKeyPathAPI(value,keyPathOnly))
         .then((data)=>this.dealResponse(data,()=>{
          this.searching = false
        }))
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
