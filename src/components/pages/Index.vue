<template>
  <div id="root">
    <layout page-header="概览"
            active-item="dashboard">
            测试
    </layout>
  </div>
</template>

<script>
import Layout from '../common/Layout'

export default {
  name: 'Index',
  components: {
    Layout,
  },
  data () {
    return {

    }
  }
}
</script>

<style scoped>

#root {
  min-width: 900px;
}
</style>
