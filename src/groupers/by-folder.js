import { isFolder } from '../utils'

export default function(files, root) {
  const fileTree = {
    contents: [],
    children: {},
  }

  files.map((file) => {
    file.relativeKey = (file.newKey || file.key).substr(root.length)
    let currentFolder = fileTree
    const folders = file.relativeKey.split('/')
    folders.map((folder, folderIndex) => {
      if (folderIndex === folders.length - 1 && isFolder(file)) {
        for (const key in file) {
          currentFolder[key] = file[key]
        }
      }
      if (folder === '') {
        return
      }
      const isAFile = (!isFolder(file) && (folderIndex === folders.length - 1))
      if (isAFile) {
        currentFolder.contents.push({
          ...file,
          keyDerived: true,
        })
      } else {
        if (folder in currentFolder.children === false) {
          currentFolder.children[folder] = {
            contents: [],
            children: {},
          }
        }
        currentFolder = currentFolder.children[folder]
      }
    })
  })

  function childIsStudent(childArr) {
    for (let idx in childArr) {
//WORKING      if ((childArr[idx].id) && (childArr[idx].id.indexOf("|") >= 0)) {
      if (childArr[idx].isStudent) {
        return true;
      }
    }

    return false;
  }

  function addAllChildren(level, prefix) {
    if (prefix !== '') {
      prefix += '/'
    }
    let files = []
    for (const folder in level.children) {
      const tmpFile = {
        ...level.children[folder],
        contents: undefined,
        keyDerived: true,
        key: root + prefix + folder + '/',
        relativeKey: prefix + folder + '/',
        children: addAllChildren(level.children[folder], prefix + folder),
        size: 0,
      }

      if (childIsStudent(tmpFile.children)) {
        tmpFile['isClass'] = true;
      }

      files.push(tmpFile)
    }
    files = files.concat(level.contents)
    return files
  }

  files = addAllChildren(fileTree, '')
  return files
}
