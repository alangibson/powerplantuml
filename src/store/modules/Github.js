/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable flowtype-errors/show-errors */
/* eslint-disable no-undef */
/* @flow */

import GitHub from 'github-api'

function clone(o: any): any {
  return JSON.parse(JSON.stringify(o))
}

const state: any = {
  // GitHub authentication token
  token: null,
  // Currently selected repository owner
  ownerName: null,
  // Currently selected repository
  repositoryName: null,
  // Currently selected repository branch
  branchName: null,
  // History of navigation
  historyStack: [],
  // Github repo object of currently selected repo
  repo: null,
  // List of repos user can access from last call to listRepositories
  repositories: [],
  // Branches in current repo
  branches: [],
  // Currently selected branch
  branch: null,
  // Currently selected tree
  tree: {},
  // Blob contents
  contents: null,
  // Authentication error message to be display on settings modal
  settingsAuthenticationErrorMessage: '',
}

const actions: any = {
  //
  // Presentation and display
  //

  showGithubModal(context: any) {
    // If no token, show settings instead
    if (!context.state.token) {
      $('#githubSettingsModal').modal('show')
      return
    }
    // HACK
    $('#selectGithubRepoModal').modal('show')
  },
  showGithubSettingsModal(context: any) {
    // HACK
    $('#githubSettingsModal').modal('show')
  },

  //
  // Authentication
  //

  /**
   * Set GitHub authentication token and load up repositories user can access
   */
  authenticateToken(context: any, token: string): Promise<*> {
    context.commit('setToken', token)
    // See if token is valid
    return new GitHub({ token: token })
      .getUser()
      .getProfile()
      .then((res: any): any => {
        context.commit('settingsAuthenticationErrorMessage', '')
        // Load GitHub state
        context.dispatch('listRepositories')
        return res
      })
      .catch((error: any) => {
        console.error(error)
        context.commit('settingsAuthenticationErrorMessage', 'Failed to authenticate you with GitHub. Please check your token.')
        throw error
      })
  },
  /**
   * Just set token without doing any sort of authentication.
   * Currently only used for Gist support.
   */
  setToken(context: any, token: string) {
    context.commit('setToken', token)
  },
  //
  // Repositories
  //

  /**
   * Load up repositories user can access
   */
  listRepositories(context: any): Promise<*> {
    return new GitHub({ token: context.state.token })
      .getUser()
      .listRepos()
      .then((res: any) => {
        context.commit('setRepositories', res.data)
      })
  },
  /**
   * Set active repository from GitHub repo object. Also sets the default branch.
   */
  setRepository(context: any, repo: any) {
    context.commit('setRepository', repo)
  },
  /**
   * Set repo by owner name and repository name.
   * Useful for jumping to a repo based on URL anchor.
   */
  setRepositoryByName(context: any, { ownerName, repositoryName }: { ownerName: string, repositoryName: string }): Promise<*> {
    return new GitHub({ token: context.state.token })
      .getRepo(ownerName, repositoryName)
      .getDetails()
      .then((res: any): any => {
        context.dispatch('setRepository', res.data)
        return res
      })
  },

  //
  // Branches
  //

  /**
   * List all branches in currently selected repo.
   */
  listSelectedRepoBranches(context: any): Promise<*> {
    return new GitHub({ token: context.state.token })
      .getRepo(context.state.ownerName, context.state.repositoryName)
      .listBranches()
      .then((res: any) => {
        context.commit('setBranches', res.data)
      })
  },
  setBranch(context: any, branch: any) {
    context.commit('setBranch', branch)
  },
  /**
   * Set selected branch in selected repo by branch name.
   */
  setBranchByName(context: any, branchName: string): Promise<*> {
    return new GitHub({ token: context.state.token })
      .getRepo(context.state.ownerName, context.state.repositoryName)
      .getBranch(branchName)
      .then((res: any): any => {
        context.dispatch('setBranch', res.data)
        return res
      })
  },
  clearBranches(context: any) {
    context.commit('setBranches', [])
  },

  //
  // Trees
  //

  setTree(context: any, tree: any) {
    context.commit('setTree', tree)
  },
  /**
   * Get tree of selected branch head.
   */
  getHeadTreeOfSelectedBranch(context: any): Promise<*> {
    return new GitHub({ token: context.state.token })
      .getRepo(context.state.ownerName, context.state.repositoryName)
      .getTree(context.state.branchName)
      .then((res: any) => {
        // Set the head tree for this branch
        let tree: any = clone(res.data)
        tree.branchName = context.state.branchName
        context.dispatch('setTree', tree)
      })
  },
  setTreeBySHA(context: any, sha: string): Promise<*> {
    return new GitHub({ token: context.state.token })
      .getRepo(context.state.ownerName, context.state.repositoryName)
      .getTree(sha)
      .then((res: any) => {
        // Set new tree
        let tree: any = clone(res.data)
        tree.branchName = context.state.branchName
        context.dispatch('setTree', tree)
      })
  },

  //
  // Blobs
  //

  setBlobBySHA(context: any, sha: string): any {
    return new GitHub({ token: context.state.token })
      .getRepo(context.state.ownerName, context.state.repositoryName)
      .getBlob(sha)
      .then((res: any) => {
        context.commit('setContents', res.data)
        context.dispatch('plantumlEditor/renderUML', res.data, { root: true })
      })
  },
  /**
   *
   * @param context
   * @param ref Name of the commit/branch/tag
   * @param path Path to file
   */
  setContents(context: any, { ref, path }: { ref: string, path: string }): any {
    return new GitHub({ token: context.state.token })
      .getRepo(context.state.ownerName, context.state.repositoryName)
      .getContents(ref, path, true)
      .then((res: any) => {
        context.commit('setContents', res.data)
        context.dispatch('plantumlEditor/renderUML', res.data, { root: true })
      })
  },

  //
  // Navigation History
  //

  backTree(context: any) {
    context.commit('backHistory')
  },
}

const mutations: any = {
  /**
   * Set authentication token
   */
  setToken(state: any, token: string) {
    state.token = token
  },
  /**
   * Set list of repositories user can access.
   */
  setRepositories(state: any, repositories: Array<any>) {
    state.repositories = repositories
  },
  /**
   * Set active repository from GitHub repo object
   */
  setRepository(state: any, repo: any) {
    state.repo = repo
    state.ownerName = repo.owner.login
    state.repositoryName = repo.name
    state.branchName = repo.default_branch
  },
  setBranch(state: any, branch: any) {
    state.branch = branch
    state.branchName = branch.name
  },
  setBranches(state: any, branches: Array<any>) {
    state.branches = branches
  },
  /**
   * Set currently selected tree
   */
  setTree(state: any, tree: any) {
    state.tree = tree
  },
  setContents(state: any, contents: string) {
    state.contents = contents
  },
  settingsAuthenticationErrorMessage(state: any, message: string) {
    state.settingsAuthenticationErrorMessage = message
  },
  pushHistory(state: any) {
    state.historyStack.push({
      ownerName: state.ownerName,
      repo: clone(state.repo),
      repositoryName: state.repositoryName,
      branch: clone(state.branch),
      branchName: state.branchName,
      branches: clone(state.branches),
      tree: clone(state.tree),
    })
  },
  backHistory(state: any) {
    let historyItem: any = state.historyStack.pop()
    if (historyItem) {
      state.tree = historyItem.tree
      state.ownerName = historyItem.ownerName
      state.repo = historyItem.repo
      state.repositoryName = historyItem.repositoryName
      state.branch = historyItem.branch
      state.branchName = historyItem.branchName
      state.branche = historyItem.branches
    } else {
      state.tree = {}
      state.ownerName = null
      state.repo = null
      state.repositoryName = null
      state.branch = null
      state.branchName = null
      state.branches = null
    }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
