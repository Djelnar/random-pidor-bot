//@ts-check
const fs = require('fs')
const fetch = require('node-fetch').default
const { promisify } = require('util')

const delayError = () => promisify(setTimeout)(1000).then(() => Promise.reject())

class Mamkoeb {
  /**
   * @type {string[]}
   */
  source = JSON.parse(fs.readFileSync('./source.json', { encoding: 'utf8' }))

  link = 'https://nameless-scrubland-47827.herokuapp.com/rey/index'

  randomInteger = () => {
    const rand = Math.random() * (this.source.length + 1)
    return Math.floor(rand)
  }

  getMfcLocal = () => {
    const num = this.randomInteger()

    const res = this.source[num]

    return res
  }

  getMfcAsync = () => {
    return fetch(this.link)
      .then((res) => {
        if (!res.ok || res.redirected) {
          return Promise.reject()
        }

        return res
      })
      .then((res) => res.text())
  }

  getMfc = async () => {
    try {
      const text = await Promise.race([this.getMfcAsync(), delayError()])

      return text
    } catch {
      return this.getMfcLocal()
    }
  }
}

module.exports = {
  Mamkoeb,
}
