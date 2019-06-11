<template>
  <div id="root">
    <layout page-header="表级别血缘-可视化"
            active-item="table">
            
            <CommonGraph ref="commonGraph" >
             <template slot="header">


    


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
                            <a-input placeholder="表名" v-model="inputClusterId"></a-input><br/> <br/>
                            <a-button icon="search" @click="showV" >Search</a-button>
                        </template>
                  </a-popover>
              </div>

                </template>
              
              <template slot="status">
                <div >
                  <br/>
                  

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

                </div>
              </template>
              
        </CommonGraph>
    </layout>
  </div>
</template>

<script>
import Layout from '../common/Layout'
import CommonGraph from '../common/CommonGraph'
import axiosRequst from '../../util/httpUtils'


export default {
  name: 'table',
  components: {
    Layout,
    CommonGraph
  },
  data () {
    return {

    }
  }
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
