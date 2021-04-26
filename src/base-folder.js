// @ts-nocheck
import PropTypes from 'prop-types'
import React from 'react'
import { moveFilesAndFolders } from './utils'

class BaseFolder extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    fileKey: PropTypes.string,

    newName: PropTypes.string,
    keyDerived: PropTypes.bool,
    isDraft: PropTypes.bool,
    isRenaming: PropTypes.bool,
    isDeleting: PropTypes.bool,
    isClass: PropTypes.bool,
    isBookmarked: PropTypes.bool,

    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    isDragging: PropTypes.bool,
    action: PropTypes.string,

    browserProps: PropTypes.shape({
      select: PropTypes.func,
      toggleFolder: PropTypes.func,
      beginAction: PropTypes.func,
      endAction: PropTypes.func,
      preview: PropTypes.func,

      createFiles: PropTypes.func,
      createFolder: PropTypes.func,
      moveFile: PropTypes.func,
      moveFolder: PropTypes.func,
      renameFolder: PropTypes.func,
      deleteFolder: PropTypes.func,
    }),
  }

  state = {
    newName: this.props.isDraft ? 'New folder' : this.getName(),
  }

  selectFolderNameFromRef(element) {
    if (element) {
      const currentName = element.value
      element.setSelectionRange(0, currentName.length)
      element.focus()
    }
  }

  getName() {
    if (this.props.name) {
      return this.props.name
    }
    const folders = this.props.fileKey.split('/')
    return this.props.newName || folders[folders.length - 2]
  }

  handleFolderClick = (event) => {
    event.stopPropagation()
    this.props.browserProps.select(this.props.fileKey, 'folder', event.ctrlKey || event.metaKey, event.shiftKey)
  }
  handleFolderDoubleClick = (event) => {
    event.stopPropagation()
    this.toggleFolder()
  }

  handleRenameClick = (event) => {
    if (!this.props.browserProps.renameFolder) {
      return
    }
    this.props.browserProps.beginAction('rename', this.props.fileKey)
  }
  handleNewNameChange = (event) => {
    const newName = event.target.value
    this.setState({ newName: newName })
  }
  handleRenameSubmit = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.renameFolder && !this.props.isDraft) {
      return
    }
    const newName = this.state.newName.trim()
    if (newName.length === 0) {
      // todo: move to props handler
      // window.notify({
      //   style: 'error',
      //   title: 'Invalid new folder name',
      //   body: 'Folder name cannot be blank',
      // })
      return
    }
    const invalidChar = ['/', '\\']
    if (invalidChar.some(char => newName.indexOf(char) !== -1)) return
    // todo: move to props handler
    // window.notify({
    //   style: 'error',
    //   title: 'Invalid new folder name',
    //   body: 'Folder names cannot contain forward slashes.',
    // })

    let newKey = this.props.fileKey.substr(0, this.props.fileKey.substr(0, this.props.fileKey.length - 1).lastIndexOf('/'))
    if (newKey.length) {
      newKey += '/'
    }
    newKey += newName
    newKey += '/'
    if (this.props.isDraft) {
      this.props.browserProps.createFolder(newKey)
    } else {
      this.props.browserProps.renameFolder(this.props.fileKey, newKey)
    }
  }

  handleDeleteClick = (event) => {
    if (!this.props.browserProps.deleteFolder) {
      return
    }
    this.props.browserProps.beginAction('delete', this.props.fileKey)
  }

  handleTableDeleteClick = (event) => {
    event.stopPropagation()
    if (!this.props.browserProps.deleteFolder) {
      return
    }
    this.props.browserProps.select(this.props.fileKey, 'folder', null, null)
    this.props.browserProps.beginAction('delete', [this.props.fileKey])
  }

  handleDeleteSubmit = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.deleteFolder) {
      return
    }
    this.props.browserProps.deleteFolder([this.props.fileKey])
  }

  handleViewSubmit = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.viewFolder) {
      return
    }
    this.props.browserProps.viewFolder([this.props.fileKey])
  }

  handleRefreshSubmit = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.refreshFolder) {
      return
    }
    this.props.browserProps.refreshFolder([this.props.fileKey])
  }

  handleRemoveBookmark = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.removeFolderBookmark) {
      return
    }

    this.props.browserProps.removeFolderBookmark([this.props.fileKey]);
  }

  handleAddBookmark = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.bookmarkFolder) {
      return
    }

    this.props.browserProps.bookmarkFolder([this.props.fileKey]);
  }

  handleCancelEdit = (event) => {
    this.props.browserProps.endAction()
  }

  toggleFolder = () => {
    this.props.browserProps.toggleFolder(this.props.fileKey)
  }

  connectDND(render) {
    const inAction = (this.props.isDragging || this.props.action)
    if (this.props.keyDerived) {
      if (
        typeof this.props.browserProps.moveFolder === 'function' &&
        !inAction &&
        !this.props.isRenaming &&
        !this.props.isDeleting
      ) {
        render = this.props.connectDragSource(render)
      }
      // Class folder cannot be a drop target
      if (
        (typeof this.props.browserProps.createFiles === 'function' ||
         typeof this.props.browserProps.moveFolder === 'function' ||
         typeof this.props.browserProps.moveFile === 'function') &&
        (!(this.props.isClass))
      ) {
        render = this.props.connectDropTarget(render)
      }
    }
    return render
  }
}

const dragSource = {
  beginDrag(props) {
    // If multiple items are not selected, and the current item that
    // was started to be dragged is not selected, then select it.
    if (
      !props.browserProps.selection.length ||
      !props.browserProps.selection.includes(props.fileKey)
    ) {
      props.browserProps.select(props.fileKey, 'folder')
    }
    return {
      key: props.fileKey,
    }
  },

  endDrag(props, monitor, component) {
    moveFilesAndFolders(props, monitor, component)
  },
}

function dragCollect(connect, monitor) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const BaseFolderConnectors = {
  dragSource,
  dragCollect,
}

export default BaseFolder
export {
  BaseFolderConnectors,
}
