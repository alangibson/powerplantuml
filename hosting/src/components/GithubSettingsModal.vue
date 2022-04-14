<template>
  <div id="githubSettingsModal" class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
          <div class="h3 modal-title">GitHub <small>Settings</small></div>
        </div>
        <div class="modal-body">
          <div v-if="settingsAuthenticationErrorMessage" class="alert alert-danger" role="alert">
            {{ settingsAuthenticationErrorMessage }}
          </div>
          <form class="form-horizontal">
            <div class="form-group">
              <label class="col-sm-4 control-label">GitHub API Token</label>
              <div class="col-sm-8">
                <label>
                  <input name="githubApiKey" v-model="githubApiKey" />
                </label>
                <span class="help-block">
                  <a href="https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/" target="_blank">Creating a personal access token</a>
                </span>
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

<script>
/* @flow */

export default {
  name: 'GithubSettingsModal',
  computed: {
    githubApiKey: {
      get(): string {
        return this.$store.state.github.token
      },
      set(value: string) {
        this.$store.dispatch('github/authenticateToken', value)
      }
    },
    settingsAuthenticationErrorMessage(): string {
      return this.$store.state.github.settingsAuthenticationErrorMessage
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
