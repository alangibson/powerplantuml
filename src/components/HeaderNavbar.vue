<template>
  <div class="navbar navbar-inverse navbar-static-top">
    <div class="container-fluid">
      <ul class="nav navbar-nav navbar-left">
        <li>
          <a href="#" @click.prevent="changeHistoryColSize">
            <span class="glyphicon glyphicon-menu-hamburger" :class="{ 'fa-rotate-90': isCloseHistory }"></span>
          </a>
        </li>
      </ul>

      <div class="navbar-header">
        <a class="navbar-brand" href="#" @click.prevent>PowerPlantUML</a>
      </div>

      <umlTemplate></umlTemplate>

      <!-- Github support -->
      <ul class="nav navbar-nav">
        <li class="dropdown">
          <a class="dropdown-toggle" data-toggle="dropdown" role="button"> <span class="glyphicon glyphicon-info-sign"></span> github <b class="caret"></b> </a>
          <ul class="dropdown-menu">
            <li>
              <a href="#selectGithubRepo" @click.prevent="selectGithubRepo">Open File</a>
            </li>
            <li>
              <a v-if="umlExtension === 'svg'" href="#createGist" @click.prevent="showGistModal">Create Gist</a>
              <a v-else style="color: grey;" @click.prevent="">Create Gist (SVG Only)</a>
            </li>
            <li>
              <a href="#selectGithubSettings" @click.prevent="selectGithubSettings">Settings</a>
            </li>
          </ul>
        </li>
      </ul>

      <ul class="nav navbar-nav">
        <li class="dropdown">
          <a class="dropdown-toggle" data-toggle="dropdown" role="button"> <span class="glyphicon glyphicon-info-sign"></span> cheat sheet <b class="caret"></b> </a>
          <ul class="dropdown-menu">
            <li>
              <a href="#CommonCheatSheet" @click.prevent="changeCheatSheetColSize">Common</a>
            </li>
            <li class="divider"></li>
            <li class="dropdown-header">behavioral diagrams</li>
            <li>
              <a href="#UseCaseCheatSheet" @click.prevent="changeCheatSheetColSize">Use Case</a>
            </li>
            <li>
              <a href="#ActivityCheatSheet" @click.prevent="changeCheatSheetColSize">Activity</a>
            </li>
            <li>
              <a href="#SequenceCheatSheet" @click.prevent="changeCheatSheetColSize">Sequence</a>
            </li>
            <li class="divider"></li>
            <li class="dropdown-header">structural diagrams</li>
            <li>
              <a href="#ObjectCheatSheet" @click.prevent="changeCheatSheetColSize">Object</a>
            </li>
            <li>
              <a href="#ClassCheatSheet" @click.prevent="changeCheatSheetColSize">Class</a>
            </li>
            <li>
              <a href="#ERCheatSheet" @click.prevent="changeCheatSheetColSize">ER diagram</a>
            </li>
          </ul>
        </li>
      </ul>

      <ul class="nav navbar-nav">
        <li>
          <a href="#" data-toggle="modal" data-target="#options"> <span class="glyphicon glyphicon-cog"></span> options </a>
        </li>
      </ul>

      <ul class="nav navbar-nav">
        <li>
          <a href="#" data-toggle="modal" data-target="#help"> <span class="glyphicon glyphicon-question-sign"></span> help </a>
        </li>
      </ul>

      <!-- Conditionally display Confluence buttons -->
      <ul v-if="enableConfluence" class="nav navbar-nav navbar-right">
        <li class="nav-item">
          <a class="nav-link" @click.prevent="cancelConfluence">Cancel</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" @click.prevent="saveConfluence">Save</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="js">
/* @flow */

import UmlTemplate from './UmlTemplate'
import Github from './GithubModal'

export default {
  name: 'HeaderNavbar',
  components: {
    UmlTemplate,
    Github
  },
  props: ['enableConfluence'],
  data() {
    return {}
  },
  computed: {
    isCloseHistory(): string {
      return this.$store.getters['layout/isCloseHistory']
    },
    umlExtension: {
      get(): string {
        return this.$store.state.plantumlEditor.umlExtension
      }
    }
  },
  methods: {
    changeHistoryColSize() {
      if (this.$store.state.layout.colSize.history) {
        this.$store.dispatch('layout/setEditColSize')
      } else {
        this.$store.dispatch('layout/resetColSize')
      }
    },
    changeCheatSheetColSize(event: any) {
      this.$store.dispatch('layout/setCheatSheetColSize')
      window.setTimeout(() => {
        const target: HTMLAnchorElement = event.target
        if (target && target.hash) {
          location.hash = target.hash
        }
        // 強制的にハッシュ削除
        window.setTimeout(() => {
          location.hash = ''
        }, 100)
      }, 100)
    },

    /*
     * Github support
     */
    selectGithubRepo() {
      this.$store.dispatch('github/showGithubModal')
    },
    selectGithubSettings() {
      this.$store.dispatch('github/showGithubSettingsModal')
    },
    showGistModal() {
      window.$('#gist').modal('show')
    },
    /*
     * Confluence support
     */
    cancelConfluence() {
      this.$store.dispatch('confluence/cancel')
    },
    saveConfluence() {
      this.$store.dispatch('confluence/save')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<<<<<<< HEAD
<style scoped>
.navbar-inverse {
  background-color: rgb(44, 44, 44);
  color: white;
  box-shadow: 5px 10px;
}
.navbar {
  box-shadow: 0 5px 2px 0 #2c2c2c;
}
.navbar-inverse .navbar-link {
  color: #ffffec;
}
.navbar-inverse .navbar-nav > li > a {
  color: #ffffec;
}
.navbar-inverse .navbar-brand {
  color: #ffffec;
}
a.dropdown-toggle {
  color: #ffffec;
}
</style>
=======
<style scoped></style>
>>>>>>> master
