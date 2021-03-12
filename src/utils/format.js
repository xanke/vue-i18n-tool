const md5 = require('md5')

function formatStr(str) {
  return md5(str).substr(0, 6)
}

exports.formatStr = formatStr
