const fs = require('fs')
const path = require('path')

class TFile {
  basePath = ''
  filePaths = []
  skipFiles = []
  componentList = []
  exts = ['.vue', '.js']

  constructor(options) {
    this.basePath = options.basePath || './'
    this.filePaths = options.filePaths || []
    this.skipFiles = options.skipFiles || []
  }

  isInList(path) {
    path = path.replace(/\\/g, '\/')
    if (this.filePaths.length) {
      return this.filePaths.some(_ => path.includes(_)) && !this.skipFiles.some(_ => path.includes(_))
    } else {
      return !this.skipFiles.some(_ => path.includes(_))
    }
  }

  mapDir(dir = this.basePath) {
    const files = fs.readdirSync(dir)
    console.log(files);
    files.forEach(filename => {
      const pathname = path.join(dir, filename)
      const stats = fs.statSync(pathname)
      if (stats.isDirectory()) {
        this.mapDir(pathname)
      } else if (stats.isFile()) {
        if (this.isInList(pathname)) {
          if (this.exts.includes(path.extname(pathname))) this.componentList.push(pathname)
        }
      }
    })

    return this.componentList
  }
}

module.exports = TFile
