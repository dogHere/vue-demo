<template>
    <div class="search-group">
        <div class="wrapper" >
                <slot></slot>
        </div>
    </div>
</template>

<script>

export default {
    name:"HeaderGroup"
}
</script>


<style lang="scss">
.search-group{
  background-color: rgb(240, 242, 245);
  height: 50px;
  display: flex;
  flex-direction: row-reverse;
  padding-right: 10px;
  padding-top: 10px;
}

.wrapper{
    button,input{
        margin-right:10px;
    }
}
</style>
