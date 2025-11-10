const AuthLib = require('./auth.lib')
const Bluebird = require('bluebird')
const { AttachmentsUtil } = require('../util')
const { ParamsUtil } = require('@filingramp/ramp-util')

class ProjectsLib {
  /**
   * @param {string|ObjectId} projectId
   * @param {string|ObjectId} productId
   * @returns {Promise<void>}
   * @description Move project to product.
   */
  static async moveProjectToProduct (projectId, productId) {
    const { data } = await AuthLib.get(`/projects/${projectId}`)
    const { attachments, subscribers } = data

    const props = ['archived', 'createdAt', 'description', 'name', 'order', 'projectNumber', 'status', 'updatedAt']
    
    const payload = { productId }
    const payloadOptional = ParamsUtil.destruct(payload, props)

    const newProject = await AuthLib.post('/projects', payloadOptional)

    const { _id } = newProject

    await AuthLib.post(`/projects/${_id}/subscribers`, { userIds: subscribers })

    await ProjectsLib._copyAttachments(attachments, _id)
  }

  /**
   * @private
   * @param {Array<Object>} attachments
   * @param {string|ObjectId} projectIdTo
   * @returns {Promise<void>}
   * @description Copy attachments.
   */
  static async _copyAttachments (attachments, projectIdTo) {
    await Bluebird.each(attachments, ProjectsLib._copyAttachment(projectIdTo))
  }

  /**
   * @private
   * @param {string|ObjectId} projectIdTo
   * @returns {function(*): Promise<*>}
   * @description Copy attachment.
   */
  static async _copyAttachment (projectIdTo) {
    return async (attachment) => {
      const { driveFile, key, name } = attachment

      if (driveFile?.file && driveFile?.version) {
        const payload = { driveFile: driveFile.file, driveFileVersion: driveFile.version }

        await AuthLib.post(`/projects/${projectIdTo}/attachments`, payload)
      } else {
        const { data: signedUrl } = await AuthLib.get(`/projects/attachments/url?key=${encodeURIComponent(key)}`)
        const value = AttachmentsUtil.toBase64(signedUrl)
        const payload = { name, value }

        await AuthLib.post(`/projects/${projectIdTo}/attachments`, payload)
      }
    }
  }
}


module.exports = ProjectsLib.moveProjectToProduct('61966eda0cffde00272ef2f5').catch(console.error)
