<template>
<div>
             <div class="search-group">
                    <div class="wrapper" >
                            <slot name="header"></slot>
                            <a-popover
                                title="图配置详情"
                                trigger="click"
                                placement="bottomLeft"
                            >
                            <a-button  type="primary" > 图配置 </a-button>
                            <template slot="content">
                                physics: <a-switch defaultUnChecked @change="changeGraphEnablePhysics"   /> <br/>
                                levelSeparation: <a-slider :defaultValue="200" :max="1500" :min="100" @change="changeLevelSeparation"   /> 
                                nodeSpacing: <a-slider :defaultValue="500" :max="2000" @change="changeNodeSpacing"   /> <br/>
                                treeSpacing: <a-slider :defaultValue="1000" @change="changeTreeSpacing"   /> <br/>
                                blockShifting: <a-switch defaultUnChecked @change="helloworld"   /> <br/>
                                edgeMinimization: <a-switch defaultUnChecked @change="helloworld"   /> <br/>
                                parentCentralization: <a-switch defaultUnChecked @change="helloworld"   /> <br/>
                                direction: <a-select defaultValue="UD" @change="changeDirection">
                                    <a-select-option value="UD">UD</a-select-option>
                                    <a-select-option value="DU">DU</a-select-option>
                                    <a-select-option value="LR">LR</a-select-option>
                                    <a-select-option value="RL">RL</a-select-option>
                                </a-select>
                            </template>
                        </a-popover>
                    </div>
            </div>

          <slot name="status"></slot>
           <div id="graph-wrapper"  >
              <network class="network" ref="network"
                :nodes = "network.nodes"
                :edges = "network.edges"
                :options="network.options">
              </network>
            </div>
 </div>           
</template>
<script>
import Network from '../common/network/Network'
import {DataSet} from 'vis'
import 'vis/dist/vis.min.css';


let options = {
  physics: {
    enabled: false,
  },
  layout: {
    hierarchical: {
      direction: "UD",
      sortMethod: "directed",
      levelSeparation:100,
      nodeSpacing: 100,
      treeSpacing:100,
      blockShifting: false,
      edgeMinimization: true,
      parentCentralization: true,
    },
    improvedLayout: true,
    randomSeed: 3
  },

  edges: {
    smooth: {
      type: 'cubicBezier',
      forceDirection: 'horizontal',
      roundness: 0.4
    },
    arrows: { to: true }
  },
  manipulation: {
    enabled: false
  },
  interaction: { 
    // dragNodes: true 
    multiselect:true,
    hover:true,
    tooltipDelay:0,
    hideNodesOnDrag:false
  }

}



export default {
  name: 'CommonGraph',
  components: {
        Network
  },
  props:{
      options: {
        type: Object,
        default: () => (options)
      }
  },
  data: () =>({
      network:{
        options ,
        nodes: new DataSet(),
        edges:new DataSet()
      },
  }),

 
  methods: {
    helloworld(){
    },

    getNetwork(){
        return this.$refs.network;
    },


    clearAll(){
        this.network.nodes.clear()
        this.network.edges.clear()
    },

    update(graph,mode,vCallback,eCallback,focus){
      if(!mode){
        mode = 'add';
      }
      if(!graph)
        return;

      if(this.network.nodes === null){
        this.network.nodes = new DataSet()
      }
      if(this.network.edges === null){
        this.network.edges = new DataSet()
      }
      let updateV = [];
      if(graph.v){
        graph.v.forEach((v)=>{
          if(v){
            if(vCallback){
                 updateV.push(vCallback(v))
                // if(mode==='add'){
                  
                //   this.network.nodes.update(vCallback(v))
                // }else{
                //   this.network.nodes.remove(vCallback(v))
                // }
            }else{
                 updateV.push(v)
                // if(mode === 'add'){
                //   this.network.nodes.update(v)
                // }else{
                //   this.network.nodes.remove(v)
                // }
            }
          }
        })
      }
      if(mode === 'add'){
        
        this.network.nodes.update(updateV)

      }else{
        this.network.nodes.remove(updateV)
      }

     let updateE = []
     if(graph.e){
        graph.e.forEach((e)=>{
          if(e){
            if(eCallback){
                updateE.push(eCallback(e))
                // if(mode==='add'){
                //   this.network.edges.update(eCallback(e))
                // }else{
                //   this.network.edges.remove(eCallback(e))
                // }
                
            }else{
                updateE.push({id:e.from+"->"+e.to,from:e.from,to:e.to})

                // if(mode === 'add'){
                //     this.network.edges.update({id:e.from+"->"+e.to,from:e.from,to:e.to})
                // }else{
                //     this.network.edges.remove({id:e.from+"->"+e.to,from:e.from,to:e.to})
                // }
            }
          }
        })
      }
      if(mode === 'add'){
        this.network.edges.update(updateE)
      }else{
        this.network.edges.remove(updateE)
      }

      if(updateV.length>0){
        this.network.nodes.update(updateV[0])
      }
      if(updateE.length>0){
        this.network.edges.update(updateE[0])
      }
      if(!focus){
        if(mode === 'add'){
          
          // updateV.forEach(v=>{
          this.getNetwork().selectNodes(updateV.map(v=>v.id))
          // })
          updateV.forEach(v=>{
            this.getNetwork().focus(v.id)
          })
        }
      }
    },

    changeGraphEnablePhysics(newValue){
      if(newValue!==this.network.options.physics.enabled){
           this.network.options.physics.enabled = newValue;
      }
    },

    changeLevelSeparation(newValue){
      if(this.network.options.layout&&this.network.options.layout.hierarchical){  
         this.network.options.layout.hierarchical.levelSeparation = newValue
      }
    },

    changeNodeSpacing(newValue){
      if(this.network.options.layout&&this.network.options.layout.hierarchical){
          this.network.options.layout.hierarchical.nodeSpacing = newValue 
      }
    },

    changeTreeSpacing(newValue){
      if(this.network.options.layout&&this.network.options.layout.hierarchical){
          this.network.options.layout.hierarchical.treeSpacing = newValue
      }
    },

    changeDirection(newValue){
      if(this.network.options.layout&&this.network.options.layout.hierarchical){
        this.network.options.layout.hierarchical.direction = newValue
      }
    },
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
    
}
#graph-wrapper .network{
  width:100%;
  height:80vh;
}

</style>