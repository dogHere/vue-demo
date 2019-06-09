<template>
  <div id="root">
    <layout page-header="图可视化"
            active-item="graph">

            <HeaderGroup>
              <a-button  type="primary" @click="helloworld" > 显示全部任务 </a-button>
              <a-button  type="primary" @click="helloworld" > 显示失败任务 </a-button>
              <a-button  type="primary" @click="helloworld" > 显示选中节点上游 </a-button>
              <a-button  type="primary" @click="helloworld" > 显示选中节点下游</a-button>
              <a-button  type="primary" @click="helloworld" > 显示在运行 </a-button>
              <a-button  type="primary" @click="helloworld" > 显示未运行最上层 </a-button>
              <a-button  type="primary" @click="helloworld" > 显示两节点之间路径 </a-button>
              
              <a-popover
                title="显示一个点"
                trigger="click"
                placement="bottomLeft"
              >
            
                <a-button  type="primary" > 显示一个点 </a-button>
               
               <template slot="content">
                  <a-input placeholder="clusterId"></a-input><br/> <br/>
                  <a-input placeholder="dagId"></a-input><br/> <br/>
                  <a-input placeholder="taskId"></a-input><br/> <br/>
                  
                  <a-button icon="search">Search</a-button>
               </template>
               
              </a-popover>
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

            </HeaderGroup>

          <div class="status">
          </div>
           <div id="graph-wrapper"  >
              <network class="network" ref="network"
                :nodes = "network.nodes"
                :edges = "network.edges"
                :options="network.options">
              </network>
            </div>
    </layout>
  </div>
</template>

<script>
import Vue from 'vue'
import Network from '../common/network/Network'
import Layout from '../common/Layout'
import HeaderGroup from '../common/HeaderGroup'
import 'vis/dist/vis.min.css';

Vue.component('network', Network);

let options = {
  physics: {
    enabled: false,
  },
  layout: {
    hierarchical: {
      direction: "UD",
      sortMethod: "directed",
      levelSeparation:100,
      nodeSpacing: 500,
      treeSpacing:1000,
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
  name: 'Graph',
  components: {
    Layout,
    HeaderGroup
  },
  data: () =>({
      network:{
        options ,
              nodes:[
                {id: 1, label: 'Node 1'},
            {id: 2, label: 'Node 2'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
              ],
              edges:[
               {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5},
            {from: 3, to: 3}
              ]
      }
  }),

 
  methods: {
    helloworld(){
     
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
  created() {
    
  },
  mounted() {
    
  },
  
  
}
</script>

<style scoped>

#root {
  min-width: 900px;
}

#graph-wrapper .network{
  width:100%;
  height:80vh;
}


</style>
