const Crypto = require('crypto')
const Axios = require('axios')
const ProgressBar = require('progress')
const { chunk } = require('lodash')

function sleep(d) {
  for (var t = Date.now(); Date.now() - t <= d;);
}

class TApi {
  from = 'zh'
  to = 'en'
  qtime = 20
  token = ''
  appid = ''

  constructor(options) {
    this.token = options.token
    this.appid = options.appid
    this.to = options.to
    this.from = options.from
    this.qtime = options.qtime || 20
  }

  async fetchBaidu(q) {
    const salt = Date.now()
    const sign = Crypto.createHash('md5').update(`${this.appid}${q}${salt}${this.token}`).digest('hex')
    const params = {
      q,
      from: this.from,
      to: this.to,
      appid: this.appid,
      salt,
      sign
    }

    const result = await Axios.get('http://api.fanyi.baidu.com/api/trans/vip/translate', {
      params
    })

    return result.data
  }

  async translateList(list) {
    const queueList = chunk(list, this.qtime)
    const nList = []
    const total = queueList.length

    var bar = new ProgressBar('[ :bar ]', { total })
    for (let i = 0; i < total; i++) {
      bar.tick()
      nList.push(...await this.fetchTranslateList(queueList[i]))
      sleep(200)
    }
    return nList
  }

  async fetchTranslateList(list) {
    const strList = []
    const nList = []
    list.forEach(item => {
      const [name] = item
      let [, str] = item
      if (!str) str = name.split('.').pop()
      strList.push(str)
    })

    const q = strList.join('\n')
    const res = await this.fetchBaidu(q)

    const { trans_result = [], error_msg } = res
    if (error_msg) console.log(error_msg)
    trans_result.forEach((item, index) => {
      const [key] = list[index]
      nList.push([key, item.dst])
    })

    return nList
  }
}

module.exports = TApi
