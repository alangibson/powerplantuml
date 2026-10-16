<template>
  <div>
    <headerNavbar :enableConfluence="enableConfluence"></headerNavbar>
    <div v-if="enableConfluence && bannerMessage" ref="banner" class="container-fluid">
      <div class="alert alert-info" role="status">{{ bannerMessage }}</div>
    </div>
    <div class="container-fluid">
      <div class="row">
        
        <div :class="[historyCol ? `col-sm-${historyCol}` : 'col-sm-2']" v-show="Boolean(historyCol)">
          <historyList :height="height"></historyList>
        </div>
        
        <div :class="[cheatSheetCol ? `col-sm-${cheatSheetCol}` : 'col-sm-3']" v-show="Boolean(cheatSheetCol)">
          <cheatSheet :height="height"></cheatSheet>
        </div>
        
        <div :class="[editorCol ? `col-sm-${editorCol}` : 'col-sm-4']" class="col-editor" v-show="Boolean(editorCol)">
          <editor :height="height"></editor>
        </div>

        <div :class="[umlCol ? `col-sm-${umlCol}` : 'col-sm-6']" v-show="Boolean(umlCol)">
          <functionTop></functionTop>
          <uml :height="umlH"></uml>
        </div>

      </div>
    </div>
    <helpModal></helpModal>
    <optionsModal></optionsModal>
    <gistModal></gistModal>
    <githubModal></githubModal>
    <githubSettingsModal></githubSettingsModal>
  </div>
</template>

<script>
/* @flow */

import $ from 'jquery'

// components
import HeaderNavbar from '../components/HeaderNavbar'
import HelpModal from '../components/HelpModal'
import OptionsModal from '../components/OptionsModal'
import GistModal from '../components/GistModal'
import GithubModal from '../components/GithubModal'
import GithubSettingsModal from '../components/GithubSettingsModal'
import HistoryList from '../components/HistoryList'
import CheatSheet from '../components/CheatSheet'
import FunctionTop from '../components/FunctionTop'
import Uml from '../components/Uml'
import Editor from '../components/Editor'

export default {
  name: 'home',
  components: {
    HeaderNavbar,
    HelpModal,
    OptionsModal,
    GistModal,
    HistoryList,
    GithubModal,
    GithubSettingsModal,
    CheatSheet,
    FunctionTop,
    Uml,
    Editor
  },
  props: ['enableConfluence', 'bannerMessage'],
  watch: {
    bannerMessage() {
      this.$nextTick(this.setHeight)
    }
  },
  computed: {
    historyCol(): number {
      return this.$store.state.layout.colSize.history
    },
    editorCol(): number {
      return this.$store.state.layout.colSize.editor
    },
    cheatSheetCol(): number {
      return this.$store.state.layout.colSize.cheatSheet
    },
    umlCol(): number {
      return this.$store.state.layout.colSize.uml
    }
  },
  data(): any {
    return {
      height: '0px',
      umlH: '0px'
    }
  },
  created() {
    this.resize()
    this.$store.dispatch('plantumlEditor/getLocalStrage')
    this.$store.dispatch('plantumlEditor/renderUML', this.$store.state.plantumlEditor.text)
    this.$store.dispatch('histories/defineScheme')
  },
  mounted() {
    this.setHeight()
    window.$('[data-toggle="tooltip"]').tooltip()

    // TODO Look for a query param ?github={..}

    //
    // Open files or render UML based on URL
    //
    // Look for a query param ?uml={..} or anchor #uml={...}
    if (this.$route.query.uml) {
      this.$store.dispatch('plantumlEditor/renderEncodedUML', this.$route.query.uml)
    } else if (this.$route.hash) {
      let anchor: string = this.$route.hash.split('#')[1]

      if (anchor.startsWith('uml')) {
        let encodedUml: string = anchor
          .split('uml=')
          .slice(1)
          .join('uml=')
        this.$store.dispatch('plantumlEditor/renderEncodedUML', encodedUml)
      } else if (anchor.startsWith('github')) {
        // Parse anchor
        let splitHash: Array<string> = anchor
          // Safely remove the first 'github='
          .split('github=')
          .slice(1)
          .join('github=')
          // Split on path separator
          .split('/')
        let [ownerName: string, repositoryName: string, shaOrRef: string, ...fileParts: string]: Array<*> = splitHash
        let path: string = fileParts.join('/')

        // Open file by path or sha
        this.$store
          .dispatch('github/setRepositoryByName', {
            ownerName: ownerName,
            repositoryName: repositoryName
          })
          .then(() => {
            if (splitHash.length === 3) {
              // Support splitHash[2] == tree sha
              this.$store.dispatch('github/setBlobBySHA', shaOrRef).then(() => {
                // Add file to history
                // TODO github path should be file id in plantumlEditor
                this.$store.dispatch('histories/save', this.$store.state.plantumlEditor)
              })
            } else {
              // Support splitHash[2] == ref and everything else is file path (like GitHub raw urls)
              this.$store.dispatch('github/setContents', { ref: shaOrRef, path: path }).then(() => {
                // Add file to history
                // TODO github path should be file id in plantumlEditor
                this.$store.dispatch('histories/save', this.$store.state.plantumlEditor)
              })
            }
          })
          .catch((error: any) => {
            // Show settings with error message
            let httpStatus: number = error.response.request.status
            if (httpStatus === 401) {
              // 401 = Unauthorized. Check token.
              this.$store.commit(
                'github/settingsAuthenticationErrorMessage',
                `Failed to open file from GitHub.
                Please make sure your authentication token is valid.
                Server said "${error.response.request.statusText}."`
              )
              $('#githubSettingsModal').modal('show')
            } else {
              // 404 = file not found
              // 422 = Unprocessable Entity when path is very wrong?
              this.$store.commit(
                'github/settingsAuthenticationErrorMessage',
                `Failed to open file from GitHub.
                Please check the path and try again.
                Server said "${error.response.request.statusText}."`
              )
              $('#githubSettingsModal').modal('show')
            }
          })
      }
    }
  },
  methods: {
    setHeight() {
      const headerHeight: number = window.$('.navbar-static-top').height()
      const functionTopHeight: number = window.$('.functionTop').height()
      const bannerHeight: number = this.$refs.banner ? window.$(this.$refs.banner).outerHeight(true) : 0
      // Reduce height to reduce overall editor height
      const height: number = Math.max(0, window.innerHeight - headerHeight - bannerHeight)
      const marginTop: number = 20
      const marginBottom: number = 10
      this.height = height + 'px'
      this.umlH = Math.max(0, height - (marginTop + functionTopHeight + marginBottom)) + 'px'
    },
    resize() {
      let timer: any = null
      window.addEventListener('resize', () => {
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          this.setHeight()
        }, this.$store.state.plantumlEditor.FPS)
      })
    }
  }
}
</script>
