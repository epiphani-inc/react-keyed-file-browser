import React from 'react'
import ClassNames from 'classnames'
import { DragSource, DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

import BaseFolder, { BaseFolderConnectors } from './../base-folder.js'
import { BaseFileConnectors } from './../base-file.js'
import { localDateFormat } from '../files/utils.js'

class RawTableFolder extends BaseFolder {
  render() {
    const {
      isOpen, isDragging, isDeleting, isRenaming, isDraft, isOver, isSelected,
      action, url, browserProps, connectDragPreview, depth, isClass
    } = this.props

    let iconType;
    let cm = undefined;
    let ce = undefined;

    if (isClass) {
      iconType = isOpen ? 'ClassFolderOpen' : 'ClassFolder';

      if (Array.isArray(this.props.children)) {
        for (let idx in this.props.children) {
          cm = this.props.children[idx].classModified;
          ce = this.props.children[idx].classExpire;

          if (cm && ce) {
            break;
          }
        }
      }
    } else {
      iconType = isOpen ? 'FolderOpen' : 'Folder';
    }

    const icon = browserProps.icons[iconType]
    const inAction = (isDragging || action)

    const ConfirmDeletionRenderer = browserProps.confirmDeletionRenderer

    let name
    if (!inAction && isDeleting && isSelected && browserProps.selection.length === 1) {
      name = (
        <ConfirmDeletionRenderer
          handleDeleteSubmit={this.handleDeleteSubmit}
          handleFileClick={this.handleFileClick}
          url={url}
          buttonText={isClass ? "Confirm Deletion of entire class" : "Confirm Deletion of all items in this folder"}
        >
          {icon}
          {this.getName()}
        </ConfirmDeletionRenderer>
      )
    } else if ((!inAction && isRenaming) || isDraft) {
      name = (
        <div>
          <form className="renaming" onSubmit={this.handleRenameSubmit}>
            {icon}
            <input
              type="text"
              ref={this.selectFolderNameFromRef}
              value={this.state.newName}
              onChange={this.handleNewNameChange}
              onBlur={this.handleCancelEdit}
              autoFocus
            />
          </form>
        </div>
      )
    } else {
      name = (
        <div>
          <a onClick={this.toggleFolder}>
            {icon}
            {this.getName()}
          </a>
        </div>
      )
    }

    let draggable = (
      <div>
        {name}
      </div>
    )
    if (typeof browserProps.moveFile === 'function') {
      draggable = connectDragPreview(draggable)
    }

    const folder = (
      <tr
        className={ClassNames('folder', {
          pending: action,
          dragging: isDragging,
          dragover: isOver,
          selected: isSelected,
        })}
        onClick={this.handleFolderClick}
        onDoubleClick={this.handleFolderDoubleClick}
      >
        <td className="name">
          <div style={{ paddingLeft: (depth * 16) + 'px' }}>
            {draggable}
          </div>
        </td>
        <td />
        {cm
          ? <td className="modified">
              {localDateFormat(cm)}
            </td>
          : <td />
        }
        {ce
          ? <td className="modified">
              {localDateFormat(ce)}
            </td>
          : <td />
        }
        {(isClass && (browserProps.selection.length <= 1))
          ? <td>
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
                onClick={this.handleTableDeleteClick}
                href="#"
                role="button"
              >
                {browserProps.icons.Delete}
              </a>
            </td>
          : <td />
        }
      </tr>
    )

    return this.connectDND(folder)
  }
}

@DragSource('folder', BaseFolderConnectors.dragSource, BaseFolderConnectors.dragCollect)
@DropTarget(
  ['file', 'folder', NativeTypes.FILE],
  BaseFileConnectors.targetSource,
  BaseFileConnectors.targetCollect
)
class TableFolder extends RawTableFolder {}

export default TableFolder
export { RawTableFolder }
