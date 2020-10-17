import { naturalSortComparer } from './utils.js'

function naturalDraftComparer(a, b) {
  if (a.draft && !b.draft) {
    return 1
  } else if (b.draft && !a.draft) {
    return -1
  }
  return naturalSortComparer(a, b)
}

function naturalSort(allFiles) {
  let folders = []
  let classes = []
  let files = []

  for (let fileIndex = 0; fileIndex < allFiles.length; fileIndex++) {
    const file = allFiles[fileIndex]
    const keyFolders = (file.newKey || file.key).split('/')
    if (file.children && !file.isClass) {
      if (!file.name) {
        file.name = keyFolders[keyFolders.length - 2]
      }
      folders.push(file)
    } else if (file.children && file.isClass) {
      if (!file.name) {
        file.name = keyFolders[keyFolders.length - 2]
      }
      classes.push(file)
    } else {
      if (!file.name) {
        file.name = keyFolders[keyFolders.length - 1]
      }
      files.push(file)
    }
  }

  files = files.sort(naturalSortComparer)
  folders = folders.sort(naturalDraftComparer)
  classes = classes.sort(naturalDraftComparer)

  for (let folderIndex = 0; folderIndex < folders.length; folderIndex++) {
    const folder = folders[folderIndex]
    folder.children = naturalSort(folder.children)
  }

  for (let folderIndex = 0; folderIndex < classes.length; folderIndex++) {
    const folder = classes[folderIndex]
    folder.children = naturalSort(folder.children)
  }

  let sortedFiles = []
  sortedFiles = sortedFiles.concat(folders)
  sortedFiles = sortedFiles.concat(classes)
  sortedFiles = sortedFiles.concat(files)
  return sortedFiles
}

export default function(files) {
  return naturalSort(files)
}
