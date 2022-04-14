<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="js">
/* @flow */

// Bootstrap
import 'bootstrap'

// store
import store from './store'
import directive from './directive'
import router from './routes'

export default {
  name: 'App',
  store,
  directive,
  router
}
</script>

<style>
/* font-awesome */
@import '../node_modules/font-awesome/css/font-awesome.min.css';
/* Bootstrap */
@import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

body {
  overflow-y: hidden;
}

.col-editor {
  margin-top: -20px;
  padding: 0;
}

.alert-default {
  background-color: #f5f5f5;
  border-color: #ddd;
}
</style>
