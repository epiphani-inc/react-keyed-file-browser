import React from 'react'
import ClassNames from 'classnames'
import { DragSource, DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

import BaseFile, { BaseFileConnectors } from './../base-file.js'
import { fileSize, localDateFormat } from './utils.js'

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

    let draggable = (
      <div>
        {name}
      </div>
    )
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
          {typeof modified === 'undefined' ? '-' : localDateFormat(modified)}
        </td>
        <td className="modified">
          {typeof expire === 'undefined' ? '-' : localDateFormat(expire)}
        </td>
        {(browserProps.selection.length <= 1) ?
          <td>
            { (!this.props.isBookmarked && !this.props.isStudent) && (
              <a
                onClick={this.handleRefreshSubmit}
                href="#"
                title="Refresh Board expiry"
                style={{textDecoration: "none"}}
                role="button"
              >
                {browserProps.icons.Refresh}
                &nbsp;&nbsp;&nbsp;
              </a>
            )}
            {(!this.props.isStudent && this.props.enableBookmarks) && (
              this.props.isBookmarked ? (
                <a
                  onClick={this.handleRemoveBookmark}
                  href="#"
                  title="Turn on board expiry"
                  style={{textDecoration: "none"}}
                  role="button"
                >
                  {browserProps.icons.Bookmarked}
                  &nbsp;&nbsp;&nbsp;
                </a>
               ) : (
                <a
                  onClick={this.handleAddBookmark}
                  href="#"
                  title="Turn off board expiry"
                  style={{textDecoration: "none"}}
                  role="button"
                >
                  {browserProps.icons.DoBookmark}
                  &nbsp;&nbsp;&nbsp;
                </a>
              )
            )}
            <a
              onClick={this.handleViewSubmit}
              href="#"
              title={!this.props.isStudent ? "View Board" : "View Student/Group Board"}
              role="button"
            >
              {browserProps.icons.View}
            </a>
            &nbsp;&nbsp;&nbsp;
            <a
              onClick={this.handleTableDeleteClick}
              href="#"
              title={!this.props.isStudent ? "Delete Board" : "Delete Student/Group Board"}
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
