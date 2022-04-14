import Vue from 'vue'
import Vuex from 'vuex'
import HeaderNavbar from '@/components/HeaderNavbar'
import plantumlEditor from '@/store/modules/PlantumlEditor'
import layout from '@/store/modules/Layout'

describe('HeaderNavbar.vue', () => {
  let vm: any = null

  beforeEach(() => {
    const Constructor: any = Vue.extend(HeaderNavbar)
    Vue.use(Vuex)
    const store: any = new Vuex.Store({
      modules: {
        plantumlEditor,
        layout
      },
    })

    vm = new Constructor({ store }).$mount()
  })

  describe('methods changeHistoryColSize', () => {
    beforeEach(() => {
      vm.$store.dispatch('layout/setEditColSize')
    })

    it('state.layout.colSize.history', () => {
      expect(vm.$store.state.layout.colSize.history).toEqual(0)
    })
    it('state.layout.colSize.editor', () => {
      expect(vm.$store.state.layout.colSize.editor).toEqual(5)
    })
    it('state.layout.colSize.cheatSheet', () => {
      expect(vm.$store.state.layout.colSize.cheatSheet).toEqual(0)
    })
    it('state.layout.colSize.uml', () => {
      expect(vm.$store.state.layout.colSize.uml).toEqual(7)
    })
  })
})
