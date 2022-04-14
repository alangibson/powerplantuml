<template>
  <div>
    <editor :enableConfluence="true"></editor>
  </div>
</template>

<script>
/* eslint-disable no-console */
import Editor from './Editor'
import AP from 'atlassian-connect'

export default {
  name: 'confluenceEditor',
  components: {
    Editor
  },
  mounted() {
    // Recover macro editor state
    AP.confluence.getMacroData((macroParams: any) => {
      console.debug(`[PowerPlantUML] Loading macro data`)
      this.$store.dispatch('confluence/loadParams', macroParams)
      console.debug(`[PowerPlantUML] Done loading macro data`)
    })
  }
}
</script>
