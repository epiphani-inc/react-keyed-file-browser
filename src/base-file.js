// @ts-nocheck
import PropTypes from 'prop-types'
import React from 'react'
import { moveFilesAndFolders } from './utils'
import { extensionMapping } from './constants.js'

class BaseFile extends React.Component {
  static propTypes = {
    fileKey: PropTypes.string,
    url: PropTypes.string,

    newKey: PropTypes.string,
    isRenaming: PropTypes.bool,

    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    isDragging: PropTypes.bool,
    action: PropTypes.string,

    browserProps: PropTypes.shape({
      icons: PropTypes.object,
      select: PropTypes.func,
      beginAction: PropTypes.func,
      endAction: PropTypes.func,
      preview: PropTypes.func,

      createFiles: PropTypes.func,
      moveFile: PropTypes.func,
      moveFolder: PropTypes.func,
      renameFile: PropTypes.func,
      deleteFile: PropTypes.func,
    }),
  }

  state = {
    newName: this.getName(),
  }

  selectFileNameFromRef(element) {
    if (element) {
      const currentName = element.value
      const pointIndex = currentName.lastIndexOf('.')
      element.setSelectionRange(0, pointIndex || currentName.length)
      element.focus()
    }
  }

  getName() {
    let name = this.props.newKey || this.props.fileKey
    const slashIndex = name.lastIndexOf('/')
    if (slashIndex !== -1) {
      name = name.substr(slashIndex + 1)
    }
    return name
  }
  getExtension() {
    const blobs = this.props.fileKey.split('.')
    return blobs[blobs.length - 1].toLowerCase().trim()
  }

  getFileType() {
    return extensionMapping[this.getExtension()] || 'File'
  }

  handleFileClick = (event) => {
    event && event.preventDefault()
    this.props.browserProps.preview({
      url: this.props.url,
      name: this.getName(),
      key: this.props.fileKey,
      extension: this.getExtension(),
    })
  }

  // Handle multiple buttons on the table row.
  handleItemClick = (event) => {
    if (event.target) {
      if (typeof event.target.tagName === "string") {
        if (event.target.tagName === "I") {
          let buttonType = event.target.getAttribute("class");
          console.log("handleItemClick: Handling view/refresh/delete button click",
            event.target, event.target.class, buttonType);
          // Font-Awesome button clicked, return to handle it
          return;
        }
      }
    }
    if (event.target && event.target.type === "submit") {
      // Handle delete confirm button
      return;
    }
    event.stopPropagation()
    this.props.browserProps.select(this.props, 'file', event.ctrlKey || event.metaKey, event.shiftKey)
  }
  handleItemDoubleClick = (event) => {
    event.stopPropagation()
    this.handleFileClick()
  }

  handleRenameClick = (event) => {
    if (!this.props.browserProps.renameFile) {
      return
    }
    this.props.browserProps.beginAction('rename', this.props)
  }
  handleNewNameChange = (event) => {
    const newName = event.target.value
    this.setState({ newName: newName })
  }
  handleRenameSubmit = (event) => {
    if (event) {
      event.preventDefault()
    }
    if (!this.props.browserProps.renameFile) {
      return
    }
    const newName = this.state.newName.trim()
    if (newName.length === 0) {
      // todo: move to props handler
      // window.notify({
      //   style: 'error',
      //   title: 'Invalid new file name',
      //   body: 'File name cannot be blank',
      // })
      return
    }
    const invalidChar = ['/', '\\']
    if (invalidChar.some(char => newName.indexOf(char) !== -1)) return
    // todo: move to props handler
    // window.notify({
    //   style: 'error',
    //   title: 'Invalid new file name',
    //   body: 'File names cannot contain forward slashes.',
    // })
    let newKey = newName
    const slashIndex = this.props.fileKey.lastIndexOf('/')
    if (slashIndex !== -1) {
      newKey = `${this.props.fileKey.substr(0, slashIndex)}/${newName}`
    }
    this.props.browserProps.renameFile(this.props, newKey)
  }

  handleTableDeleteClick = (event) => {
    console.log("handleTableDeleteClick:", event, event.target)
    event.preventDefault()
    if (!this.props.browserProps.deleteFile) {
      return
    }
    this.props.browserProps.select(this.props, 'file', null, null)
    this.props.browserProps.beginAction('delete', this.props)
  }

  handleDeleteClick = (event) => {
    if (!this.props.browserProps.deleteFile) {
      return
    }
    this.props.browserProps.beginAction('delete', this.props)
  }
  handleDeleteSubmit = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.deleteFile) {
      return
    }

    this.props.browserProps.deleteFile([this.props]);
  }

  handleViewSubmit = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.viewFile) {
      return
    }

    this.props.browserProps.viewFile([this.props]);
  }

  handleRefreshSubmit = (event) => {
    event.preventDefault()
    if (!this.props.browserProps.refreshFile) {
      return
    }

    this.props.browserProps.refreshFile([this.props]);
  }

  handleCancelEdit = (event) => {
    this.props.browserProps.endAction()
  }

  connectDND(render) {
    const inAction = (this.props.isDragging || this.props.action)
    if (
      typeof this.props.browserProps.moveFile === 'function' &&
      !inAction &&
      !this.props.isRenaming
    ) {
      render = this.props.connectDragSource(render)
    }

    // Student files cannot be drop targets.
    if (
      (typeof this.props.browserProps.createFiles === 'function' ||
       typeof this.props.browserProps.moveFile === 'function' ||
       typeof this.props.browserProps.moveFolder === 'function') &&
      (!(this.props.isStudent))
    ) {
      render = this.props.connectDropTarget(render)
    }
    return render
  }
}

// Folders are selected as string, files are selected as objects
const baseFileIsItemSelected = (item) => {
  let foundItem = false;
  let selection = item.browserProps.selection;
  for (let idx in selection) {
    let curSel = selection[idx];
    if (typeof curSel === "string") {
      foundItem = (curSel === item.key) ? true : false;
      if (foundItem) break;
    } else if (curSel.id === item.id) {
      foundItem = true;
      break;
    }
  }

  return foundItem;
}

const dragSource = {
  beginDrag(props) {
    // Cannot use a simple includes any more as folders are
    // strings but files are now objects. To handle this, we use
    // the new function "baseFileIsItemSelected"
    if (
      !props.browserProps.selection.length ||
      !baseFileIsItemSelected(props)
    ) {
      props.browserProps.select(props, 'file')
    }
    return {
      key: props,
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

const targetSource = {
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return
    }
    const key = props.newKey || props.fileKey
    const slashIndex = key.lastIndexOf('/')
    const path = (slashIndex !== -1) ? key.substr(0, slashIndex + 1) : ''
    const item = monitor.getItem()
    if (item.files && props.browserProps.createFiles) {
      props.browserProps.createFiles(item.files, path)
    }
    return {
      path: path,
    }
  },
}

function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
  }
}

const BaseFileConnectors = {
  dragSource,
  dragCollect,
  targetSource,
  targetCollect,
}

export default BaseFile
export {
  BaseFileConnectors,
}
