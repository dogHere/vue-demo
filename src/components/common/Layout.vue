<template>
  <a-layout id="components-layout-demo-side"
            style="min-height: 100vh">
    <a-layout-sider v-model="collapsed"
                    :collapsible="true">
      <div class="logo">
        <img src="../../assets/logo.png"
             class="logo-img">
        <span v-if="!collapsed"
              class="logo-title">数据平台</span>
      </div>
      <a-menu theme="dark"
              :default-selected-keys="[activeItem]"
              mode="inline">
        <a-menu-item v-for="menuItem in menuItems"
                     :key="menuItem.key">
          <router-link :to="{name: menuItem.key}">

            <a-icon :type="menuItem.icon"
                    style="fontSize: 22px" />
            <span>{{ menuItem.title }}</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <h2 class="page-header">{{ pageHeader }}</h2>
        <div class="btn-group"><slot name="header" /></div>
      </a-layout-header>
      <a-layout-content style="margin: 20px 16px">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <slot />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        数据平台 ©2019 Created by xianglei.ran
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script>

export default {
  name: 'Layout',
  props: ['pageHeader', 'activeItem'],
  data () {
    return {
      collapsed: true,
      menuItems: [
        {
          key: 'graph',
          icon: 'dashboard',
          title: '图可视化'
        },
        {
          key: 'index',
          icon: 'project',
          title: '概览'
        },
        {
          key: 'develop',
          icon: 'rocket',
          title: '开发',
        },
        {
          key: 'urls',
          icon: 'appstore',
          title: 'url列表'
        },
        {
          key: 'projects',
          icon: 'project',
          title: '工程'
        },
        {
          key: 'publish',
          icon: 'cluster',
          title: '发布'
        }
      ]
    }
  },
  methods: {
    onClickMenu (key) {
      // location.href = `http://localhost:8000/ada-desktop-web/${key}`
    }
  }
}
</script>

<style lang="scss">
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  .logo-img {
    width: 45px;
    height: 45px;
  }
  .logo-title {
    font-size: 20px;
    margin-left: 5px;
    color: #fff;
  }
}

.page-header {
  margin-left: 20px;
  display: inline-block;
}

.btn-group {
  float: right;
  margin-right: 20px;
}

</style>
