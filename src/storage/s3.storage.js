class S3Storage {
  /**
   * @param {Object} options
   * @returns {void}
   * @description Initialize.
   */
  static init (options) {
    const params = {
      endpoint: options.ENDPOINT,
      region: options.REGION
    }

    if (options.ACCESS_KEY_ID) {
      params.credentials = { accessKeyId: options.ACCESS_KEY_ID, secretAccessKey: options.SECRET_ACCESS_KEY }
    }

    S3Storage._CLIENT = new S3Client(params)
    S3Storage._BUCKET_PROJECTS = options.BUCKET_PROJECTS
  }

  /**
   * @description Copy object from one s3 bucket to another.
   * @param {string} bucketFrom
   * @param {string} keyFrom
   * @param {string} bucketTo
   * @param {string} keyTo
   * @returns {Promise<Object>}
   */
  static copyBetweenBuckets (bucketFrom, keyFrom, bucketTo, keyTo) {
    LoggerUtil.debug(`Copying... from key:${keyFrom}, bucket: ${bucketFrom}, to: key:${keyTo}, bucket: ${bucketTo}...`)

    const params = {
      Bucket: bucketTo,
      CopySource: `${bucketFrom}/${keyFrom}`,
      Key: keyTo
    }

    const command = new CopyObjectCommand(params)
    return S3Storage._CLIENT.send(command)
  }
}

S3Storage._BUCKET_PROJECTS = null
S3Storage._CLIENT = {}

module.exports = S3Storage
