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
import github from './modules/Github'
import confluence from './modules/Confluence'

// https://flow.org/en/docs/lang/types-first/

const store: any = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    plantumlEditor,
    layout,
    histories,
    umlTemplate,
    cheatSheet,
    gistApi,
    github,
    confluence,
  },
  plugins: [createPersistedState()],
})

export default store
