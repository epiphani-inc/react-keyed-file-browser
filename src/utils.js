function isFolder(file) {
  return file.key.endsWith('/')
}

function moveFilesAndFolders(props, monitor, component) {
  if (!monitor.didDrop()) {
    return
  }

  const dropResult = monitor.getDropResult()

  const folders = []
  const files = []

  console.log("moveFilesAndFolders:", props.browserProps.selection);
  props.browserProps.selection.forEach(selection => {
    console.log("moveFilesAndFolders: checking:", selection);
    if (typeof selection === "string") {
      selection[selection.length - 1] === '/' ? folders.push(selection) : files.push(selection)
    } else {
      // We don't want to allow student files to be moved in case of a multiple selection
      if (!(selection.isStudent)) {
        console.log("moveFilesAndFolders: adding file")
        selection.fileKey[selection.fileKey.length - 1] === '/' ? folders.push(selection) : files.push(selection)
      } else {
        console.log("moveFilesAndFolders: Skipping moving student file in case of multi select");
      }
    }
  })

  console.log("moveFilesAndFolders: files", files, "folder:", folders);
  props.browserProps.openFolder(dropResult.path)

  folders
    .forEach(selection => {
      const fileKey = selection
      const fileNameParts = fileKey.split('/')
      const folderName = fileNameParts[fileNameParts.length - 2]

      const newKey = `${dropResult.path}${folderName}/`
      // abort if the new folder name contains itself
      if (newKey.substr(0, fileKey.length) === fileKey) return

      if (newKey !== fileKey && props.browserProps.moveFolder) {
        props.browserProps.moveFolder(fileKey, newKey)
      }
    })

  files
    .forEach(selection => {
      // file selections are objects not strings any more
      const fileKey = (typeof selection === "string") ? selection : selection.fileKey
      const fileNameParts = fileKey.split('/')
      const fileName = fileNameParts[fileNameParts.length - 1]
      const newKey = `${dropResult.path}${fileName}`
      if (newKey !== fileKey && props.browserProps.moveFile) {
        // pass the selection object instead of the fileKey
        props.browserProps.moveFile(selection, newKey)
      }
    })
}

export { isFolder, moveFilesAndFolders }
