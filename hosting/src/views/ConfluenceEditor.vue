<template>
  <div>
    <editor :enableConfluence="true" :bannerMessage="bannerMessage"></editor>
  </div>
</template>

<script>
/* eslint-disable no-console */
import Editor from './Editor'
import AP from 'atlassian-connect'
import { UNLICENSED_BANNER_MESSAGE } from '../config/banner'

export default {
  name: 'confluenceEditor',
  components: {
    Editor
  },
  computed: {
    bannerMessage(): string {
      // Active licenses include trials. Show the banner when license status is absent.
      return this.$route.query.lic === undefined || this.$route.query.lic === 'none' ? UNLICENSED_BANNER_MESSAGE : ''
    }
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
