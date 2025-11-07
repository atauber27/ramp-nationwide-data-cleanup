const fs = require('fs')
const { appendFile } = fs.promises
const axios = require('axios').default
const axiosRetry = require('axios-retry').default
const { USERNAME, PASSWORD, BASE_URL } = require('../config/variables.config')
const instance = axios.create({ baseURL: BASE_URL, timeout: 0 })

axiosRetry(instance, {
  onRetry: async (retryCount, error, requestConfig) => {
    const { data, baseURL, method, url } = requestConfig
    await appendFile('./error-retry-logs.txt', `\nRetry: ${error} - Retry Count: ${retryCount}`)
    await appendFile('./error-retry-logs.txt', `\nRetry: ${baseURL}, ${method}, ${url}, ${data}`)
  },
  retries: 5,
  retryCondition: (error) => {
    return error.response.status === 502 || error.response.status === 424
  },
  retryDelay: () => {
    return 1000
  }
})
/* eslint-disable no-console */
class AuthLib {
  static async authenticate () {
    await this._login()
  }

  static async get (url) {
    await AuthLib._validateToken()
    return instance.get(url)
  }

  static async put (url, payload) {
    await AuthLib._validateToken()
    return instance.put(url, payload)
  }

  static async post (url, payload) {
    await AuthLib._validateToken()
    return instance.post(url, payload)
  }

  static async patch (url, payload) {
    await AuthLib._validateToken()
    return instance.patch(url, payload)
  }

  static async delete (url) {
    await AuthLib._validateToken()
    return instance.delete(url)
  }

  static async _validateToken () {
    const isValid = AuthLib._isValid()
    if (!isValid) {
      await AuthLib._login()
    }
  }

  static async _login () {
    try {
      console.log('Authenticating...')
      const payload = { password: PASSWORD, username: USERNAME }
      const { data } = await instance.post('/auth/authentication/local', payload)
      AuthLib._token = data
      instance.defaults.headers = { Authorization: data.accessToken }
    } catch (error) {
      console.error(`Auth Error - ${error}`)
    }
  }

  static _isValid () {
    const { expiresIn, issuedAt } = AuthLib._token
    const validUntil = new Date(issuedAt).getTime() + expiresIn * 1000 - AuthLib._THRESHOLD
    const current = new Date().getTime()
    return current <= validUntil
  }
}

AuthLib._token = {}
AuthLib._THRESHOLD = 2 * 60 * 1000
module.exports = AuthLib
