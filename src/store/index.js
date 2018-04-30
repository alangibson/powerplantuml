/* @flow */

import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

import plantumlEditor from './modules/PlantumlEditor'
import layout from './modules/Layout'
import histories from './modules/Histories'
import umlTemplate from './modules/UmlTemplate'
import cheatSheet from './modules/CheatSheet'
import gistApi from './modules/GistApi'

export default new Vuex.Store({
  modules: {
    plantumlEditor,
    layout,
    histories,
    umlTemplate,
    cheatSheet,
    gistApi
  },
  plugins: [createPersistedState()]
})
