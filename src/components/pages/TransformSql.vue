<template>
<div id="root" >
    
</div>    
</template>
<script>
import _ from 'lodash'
import {axiosRequst} from '../../util/httpUtils'


export default {
 name: 'Graph',
  components: {

  },
  data() {
    return {
     
    }
  },
 
  computed: {
    
  },  
  methods: {
        
    
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