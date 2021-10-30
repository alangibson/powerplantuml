<template>
  <div id="options" class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">
            <span>&times;</span>
          </button>
          <div class="h3 modal-title">Options</div>
        </div>
        <div class="modal-body">
          <form class="form-horizontal">
            <div class="form-group">
              <label class="col-sm-2 control-label">keymap</label>
              <div class="col-sm-10">
                <label class="radio-inline">
                  <input type="radio" name="keymap" v-model="keymap" value="sublime" />
                  sublime
                </label>
                <label class="radio-inline">
                  <input type="radio" name="keymap" v-model="keymap" value="vim" />
                  vim
                </label>
                <label class="radio-inline">
                  <input type="radio" name="keymap" v-model="keymap" value="emacs" />
                  emacs
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-2 control-label">indent</label>
              <div class="col-sm-10">
                <label class="radio-inline">
                  <input type="radio" name="indent" v-model="indent" value="space2" />
                  space 2
                </label>
                <label class="radio-inline">
                  <input type="radio" name="indent" v-model="indent" value="space4" />
                  space 4
                </label>
                <label class="radio-inline">
                  <input type="radio" name="indent" v-model="indent" value="tab" />
                  tab
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-2 control-label">theme</label>
              <div class="col-sm-10">
                <select class="form-control theme" v-model="theme">
                  <option v-for="themeVal in themes" :key="themeVal.name" :value="themeVal.name">{{ themeVal.name }}</option>
                </select>
              </div>
            </div>

            <!-- <div class="form-group">
              <label class="col-sm-2 control-label">width</label>
              <div class="col-sm-5">
                <label class="radio-inline">
                  history <input name="indent" v-model="historyCol" /> cols
                </label>
                <label class="radio-inline">
                  cheatsheet <input name="indent" v-model="cheatSheetCol" /> cols
                </label>
                <label class="radio-inline">
                  editor
                  <input name="indent" v-model="editorCol" />
                  cols
                </label>
                <label class="radio-inline">
                  diagram
                  <input name="indent" v-model="umlCol" />
                  cols
                </label>
              </div>
            </div> -->

            <div class="form-group">
              <label class="col-sm-4 control-label">PlantUML server</label>
              <div class="col-sm-8">
                <input name="cdn" v-model="cdn" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
/* @flow */

export default {
  name: 'OptionsModal',
  computed: {
    keymap: {
      get(): string {
        return this.$store.state.plantumlEditor.codemirrorOptions.keyMap
      },
      set(value: string) {
        this.$store.dispatch('plantumlEditor/syncCodeMirrorKeyMap', value)
      }
    },
    indent: {
      get(): string {
        return this.$store.state.plantumlEditor.codemirrorIndent
      },
      set(value: string) {
        this.$store.dispatch('plantumlEditor/syncCodeMirrorIndent', value)
      }
    },
    cdn: {
      get(): string {
        return this.$store.state.plantumlEditor.cdn
      },
      set(value: string) {
        this.$store.dispatch('plantumlEditor/setCDN', value)
      }
    },
    // historyCol(): number {
    //   return this.$store.state.layout.colSize.history
    // },
    // editorCol(): number {
    //   return this.$store.state.layout.colSize.editor
    // },
    // cheatSheetCol(): number {
    //   return this.$store.state.layout.colSize.cheatSheet
    // },
    // umlCol(): number {
    //   return this.$store.state.layout.colSize.uml
    // },
    theme: {
      get(): string {
        return this.$store.state.plantumlEditor.codemirrorOptions.theme
      },
      set(value: string) {
        this.$store.dispatch('plantumlEditor/syncCodeMirrorTheme', value)
      }
    },

    themes(): { name: string; color: string } {
      return this.$store.state.plantumlEditor.themes
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#options {
  .theme {
    width: 220px;
  }
}
</style>
