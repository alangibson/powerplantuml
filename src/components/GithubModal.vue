<template>
  <div id="selectGithubRepoModal" class="modal fade">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
          <div class="h3 modal-title">GitHub <small>Open File</small></div>
        </div>

        <div class="modal-body">
          <div class="container-fluid">
            <div class="col-sm-4">
              <!-- Left-hand list of repos and and branches -->
              <ul id="repo-branch-list" class="menu-list">
                <li v-for="repo in repositories" :key="repo.id">
                  <a @click="setRepository(repo)">
                    {{ repo.full_name }}
                  </a>
                  <ul v-if="repo.name === $store.state.github.repositoryName">
                    <li v-for="(branch, index) in $store.state.github.branches" :key="index">
                      <a @click.stop="setBranch(branch)">{{ branch.name }}</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
            <div v-if="hasSelection" class="col-sm-8">
              <!-- Back button -->
              <a @click.stop="$store.dispatch('github/backTree')">
                <i class="fa fa-arrow-circle-left"></i>
              </a>

              <!-- Currently selected repo and branch -->
              {{ $store.state.github.ownerName }} / {{ $store.state.github.repositoryName }} / {{ $store.state.github.branchName }}

              <div v-if="$store.state.github.tree.branchName" class="container-fluid menu-list">
                <div v-for="tree in treesInSelectedBranch" :key="tree.sha" class="row">
                  <div class="col-sm-1">
                    <i v-if="tree.type === 'tree'" class="fa fa-folder-open"> </i>
                    <i v-else-if="tree.type === 'blob'" class="fa fa-file"> </i>
                  </div>
                  <div class="col-sm-5">
                    <a @click.stop="openTree(tree)">{{ tree.path }}</a>
                  </div>
                  <div class="col-sm-3">
                    {{ tree.type }}
                  </div>
                  <div class="col-sm-3">
                    {{ tree.size }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click.prevent="refresh" type="button" class="btn btn-secondary">Refresh</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* flow */
// import $ from 'jquery'
/* eslint-disable flowtype/require-parameter-type */
/* eslint-disable flowtype/require-return-type */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

export default {
  computed: {
    treesInSelectedBranch(): Array<any> {
      return this.$store.state.github.tree.tree.concat().sort((a, b) => {
        if (a.type === 'tree') {
          return -1
        } else {
          return 1
        }
      })
    },
    hasSelection(): boolean {
      return !!this.$store.state.github.ownerName
    },
    /**
     * Return sorted list of repositories.
     */
    repositories() {
      return this.$store.state.github.repositories.slice(0).sort((a, b) => {
        if (a.full_name.toLowerCase() < b.full_name.toLowerCase()) {
          return -1
        } else {
          return 1
        }
      })
    }
  },
  methods: {
    setRepository(repo: any) {
      this.$store.commit('github/pushHistory')
      this.$store.dispatch('github/setRepository', repo).then(() => {
        this.$store.dispatch('github/clearBranches').then(() => {
          this.$store.dispatch('github/listSelectedRepoBranches')
          this.$store.dispatch('github/setBranchByName', repo.default_branch).then(() => {
            this.$store.dispatch('github/getHeadTreeOfSelectedBranch')
          })
        })
      })
    },
    setBranch(branch: any) {
      this.$store.commit('github/pushHistory')
      this.$store.dispatch('github/setBranch', branch).then(() => {
        this.$store.dispatch('github/getHeadTreeOfSelectedBranch')
      })
    },
    openTree(tree: any) {
      if (tree.type === 'tree') {
        this.$store.dispatch('github/setTreeBySHA', tree.sha)
      } else if (tree.type === 'blob') {
        this.$store.dispatch('github/setBlobBySHA', tree.sha)
        // Set window.location.hash
        window.location.hash = '#github=' + this.$store.state.github.ownerName + '/' + this.$store.state.github.repositoryName + '/' + tree.sha
        // Close modal
        // Doesnt work: this.showModal = false
        $('#selectGithubRepoModal').modal('hide')
      }
    },
    // Reload GitHub state
    refresh() {
      this.$store.dispatch('github/listRepositories')
      this.$store.dispatch('github/listSelectedRepoBranches')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#selectGithubRepoModal .modal-dialog {
  width: 120rem;
}

.menu-list a {
  cursor: pointer;
}
</style>
