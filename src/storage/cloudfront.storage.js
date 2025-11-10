class CloudfrontStorage {
  /**
   * @param {Object} options
   * @returns {void}
   * @description Initialize cloudfront.
   */
  static init (options) {
    CloudfrontStorage._domainAttachments = options.DOMAIN_ATTACHMENTS
    CloudfrontStorage._expire = options.EXPIRE
    CloudfrontStorage._params = {
      keyPairId: options.KEY_PAIR_ID,
      privateKey: options.PRIVATE_KEY
    }
  }

  /**
   * @public
   * @param {string} key
   * @returns {string}
   * @description Get attachment signed url.
   */
  static getAttachmentSignedUrl (key) {
    return CloudfrontStorage._getSignedUrl(key, CloudfrontStorage._domainAttachments)
  }

  /**
   * @private
   * @param {string} key
   * @param {string} domain
   * @returns {string}
   * @description Get signed url.
   *  Note, cloudfront throws access denied error if key contains whitespaces.
   *  Replace whitespaces by '+' before signing.
   */
  static _getSignedUrl (key, domain) {
    LoggerUtil.debug(`Singing url... key: ${key}, domain: ${domain}.`)

    const _key = key.replace(/\x20/gu, '+')

    const url = `${domain}/${_key}`
    const params = {
      ...CloudfrontStorage._params,
      dateLessThan: new Date(Date.now() + CloudfrontStorage._expire)
    }

    return awsCloudfrontSigner.getSignedUrl({ url, ...params })
  }
}

CloudfrontStorage._domainAttachments = null
CloudfrontStorage._expire = null
CloudfrontStorage._params = {}

module.exports = CloudfrontStorage
