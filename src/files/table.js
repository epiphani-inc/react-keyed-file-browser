import React from 'react'
import ClassNames from 'classnames'
import { DragSource, DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { formatDistanceToNow } from 'date-fns'

import BaseFile, { BaseFileConnectors } from './../base-file.js'
import { fileSize } from './utils.js'

class RawTableFile extends BaseFile {
  render() {
    const {
      isDragging, isDeleting, isRenaming, isOver, isSelected,
      action, url, browserProps, connectDragPreview,
      depth, size, modified, expire, isDraggable
    } = this.props

    let icon = browserProps.icons[this.getFileType()] || browserProps.icons.File
    const inAction = (isDragging || action)

    if (this.props.isStudent) {
      icon = browserProps.icons.StudentFile;
    }

    const ConfirmDeletionRenderer = browserProps.confirmDeletionRenderer

    let name
    if (!inAction && isDeleting && browserProps.selection.length === 1) {
      name = (
        <ConfirmDeletionRenderer
          handleDeleteSubmit={this.handleDeleteSubmit}
          handleFileClick={this.handleFileClick}
          url={url}
        >
          {icon}
          {this.getName()}
        </ConfirmDeletionRenderer>
      )
    } else if (!inAction && isRenaming) {
      name = (
        <form className="renaming" onSubmit={this.handleRenameSubmit}>
          {icon}
          <input
            ref={this.selectFileNameFromRef}
            type="text"
            value={this.state.newName}
            onChange={this.handleNewNameChange}
            onBlur={this.handleCancelEdit}
            autoFocus
          />
        </form>
      )
    } else {
      name = (
        <a
          href={url || '#'}
          download="download"
          onClick={this.handleFileClick}
        >
          {icon}
          {this.getName()}
        </a>
      )
    }

    //console.log("RawTableFile: isDraggable", isDraggable, this.props);
    let draggable = (
      <div>
        {name}
      </div>
    )
    // if (typeof browserProps.moveFile === 'function') {
    if ((typeof browserProps.moveFile === 'function') && (isDraggable)) {
      draggable = connectDragPreview(draggable)
    }

    const row = (
      <tr
        className={ClassNames('file', {
          pending: action,
          dragging: isDragging,
          dragover: isOver,
          selected: isSelected,
        })}
        onClick={this.handleItemClick}
        onDoubleClick={this.handleItemDoubleClick}
        draggable={isDraggable ? "true" : "false"}
      >
        <td className="name">
          <div style={{ paddingLeft: (depth * 16) + 'px' }}>
            {draggable}
          </div>
        </td>
        <td className="size">{fileSize(size)}</td>
        <td className="modified">
          {typeof modified === 'undefined' ? '-' : formatDistanceToNow(modified, { addSuffix: true })}
        </td>
        <td className="modified">
          {typeof expire === 'undefined' ? '-' : formatDistanceToNow(expire, { addSuffix: true })}
        </td>
        {(browserProps.selection.length <= 1) ?
          <td>
            <a
              onClick={this.handleRefreshSubmit}
              href="#"
              role="button"
            >
              {browserProps.icons.Refresh}
            </a>
            &nbsp;&nbsp;&nbsp;
            <a
              onClick={this.handleViewSubmit}
              href="#"
              role="button"
            >
              {browserProps.icons.View}
            </a>
            &nbsp;&nbsp;&nbsp;
            <a
              onClick={this.handleDeleteSubmit}
              href="#"
              role="button"
            >
              {browserProps.icons.Delete}
            </a>
          </td> :
          <td />
        }
      </tr>
    )

    if (!(isDraggable)) {
      // return row such that we do not make it draggable below
      return row;
    }

    return this.connectDND(row)
  }
}

@DragSource('file', BaseFileConnectors.dragSource, BaseFileConnectors.dragCollect)
@DropTarget(
  ['file', 'folder', NativeTypes.FILE],
  BaseFileConnectors.targetSource,
  BaseFileConnectors.targetCollect
)
class TableFile extends RawTableFile {}

export default TableFile
export { RawTableFile }
