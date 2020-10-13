import PropTypes from 'prop-types'
import React from 'react'
import ClassNames from 'classnames'

import { DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

import { BaseFileConnectors } from './../base-file.js'

class RawTableHeader extends React.Component {
  static propTypes = {
    select: PropTypes.func,
    fileKey: PropTypes.string,

    connectDropTarget: PropTypes.func,
    isOver: PropTypes.bool,
    isSelected: PropTypes.func,

    browserProps: PropTypes.shape({
      columns: PropTypes.arrayOf(PropTypes.string),
      headers: PropTypes.element,
      createFiles: PropTypes.func,
      moveFolder: PropTypes.func,
      moveFile: PropTypes.func,
    }),
  }

  handleHeaderClick(event) {
    this.props.select(this.props.fileKey)
  }

  render() {
    const header = (
      <tr
        className={ClassNames('folder', {
          dragover: this.props.isOver,
          selected: this.props.isSelected,
        })}
      >
        {(this.props.browserProps.columns && this.props.browserProps.headers) ? 
        <>
        {/*this.props.browserProps.columns.map(row => (
          <th className={row}>{this.props.browserProps.headers[row].name}</th>
        ))*/}
        {Object.entries(this.props.browserProps.headers).map( ([key, ch]) => {
          if (!ch.isHidden) {
          return (
            <th className={key}>{ch.name}</th>
            )
          }
        })}
        </>
        :
        <>
        <th>File</th>
        <th className="size">Size</th>
        <th className="modified">Last Modified</th>
        </>
        }
      </tr>
    )

    if (
      typeof this.props.browserProps.createFiles === 'function' ||
      typeof this.props.browserProps.moveFile === 'function' ||
      typeof this.props.browserProps.moveFolder === 'function'
    ) {
      return this.props.connectDropTarget(header)
    } else {
      return header
    }
  }
}

@DropTarget(
  ['file', 'folder', NativeTypes.FILE],
  BaseFileConnectors.targetSource,
  BaseFileConnectors.targetCollect
)
class TableHeader extends RawTableHeader {}

export default TableHeader
export { RawTableHeader }
