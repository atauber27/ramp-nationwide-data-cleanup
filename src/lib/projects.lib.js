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
    try {
      const { data } = await AuthLib.get(`/projects/${projectId}`)
      const { attachments, customFields, stateCustomFields, subscribers } = data

      const props = ['archived', 'createdAt', 'description', 'name', 'order', 'projectNumber', 'status', 'updatedAt']
      
      const payload = { productId }
      const payloadOptional = ParamsUtil.destruct(payload, props)

      const newProject = await AuthLib.post('/projects', payloadOptional)

      const { _id } = newProject

      await AuthLib.post(`/projects/${_id}/subscribers`, { userIds: subscribers })

      await ProjectsLib._copySubResources(attachments, customFields, _id, stateCustomFields)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * @param {Array<Object>} attachments
   * @param {Array<Object>} customFields
   * @param {string|ObjectId} projectIdTo
   * @param {Array<Object>} stateCustomFields
   * @returns {Promise<void>}
   * @description Copy sub-resources.
  */
  static async _copySubResources (attachments, customFields, projectIdTo, stateCustomFields) {
    await ProjectsLib._copyAttachments(attachments, projectIdTo)

    await ProjectsLib._copyCustomFields(customFields, projectIdTo)

    await ProjectsLib._copyStateCustomFields(stateCustomFields, projectIdTo)
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
      try {
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
      } catch (error) {
        console.error(error)
      }
    }
  }

  /**
   * @private
   * @param {string|ObjectId} projectIdTo
   * @returns {Promise<void>}
   * @description Copy custom fields.
   */
  static async _copyCustomFields (customFields, projectIdTo) {
    await Bluebird.each(customFields, ProjectsLib._copyCustomField(projectIdTo))
  }

  /**
   * @private
   * @param {string|ObjectId} projectIdTo
   * @returns {function(*): Promise<*>}
   * @description Copy custom field.
   */
  static async _copyCustomField (projectIdTo) {
    return async (customField) => {
      try {
        const props = ['company', 'customFieldId', 'state', 'value']

        const payload = ParamsUtil.destruct(customField, props)
        payload.operator = 'add'

        await AuthLib.put(`/projects/${projectIdTo}/customFields`, payloadOptional)
      } catch (error) {
        console.error(error)
      }
    }
  }
}


module.exports = ProjectsLib
