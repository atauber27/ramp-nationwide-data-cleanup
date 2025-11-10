const https = require('https')

class AttachmentsUtil {
  /**
   * @param {string} signedUrl
   * @returns {Promise<string>}
   * @description To base 64.
   */
  static async toBase64 (signedUrl) {
    return new Promise((resolve, reject) => {
      https.get(signedUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch: ${response.statusCode}`))
          return
        }
        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => {
          const buffer = Buffer.concat(chunks)
          resolve(buffer.toString('base64'))
        })
        response.on('error', reject)
      }).on('error', reject)
    })
  }
}

module.exports = AttachmentsUtil
