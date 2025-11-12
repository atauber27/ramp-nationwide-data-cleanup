const AuthLib = require('./auth.lib')
const Bluebird = require('bluebird')
const { AttachmentsUtil, CustomFieldsUtil } = require('../util')
const { ParamsUtil } = require('@filingramp/ramp-util')
const { CustomFieldEnum } = require('@filingramp/ramp-schemas')

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
      const payload = { ...ParamsUtil.destruct(data, props), productId }

      const { data: newProject } = await AuthLib.post('/projects', payload)

      const { _id } = newProject

      await AuthLib.post(`/projects/${_id}/subscribers`, { userIds: subscribers })

      await ProjectsLib._copySubResources(attachments, customFields, _id, stateCustomFields)

      await FilingsLib._moveFilingsToProject(projectId, _id, productId)
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

    const { projectCustomFieldsList, stateCustomFieldsList } = await CustomFieldsUtil.getCustomFieldsList()

    await ProjectsLib._copyCustomFields(customFields, projectCustomFieldsList, projectIdTo)

    await ProjectsLib._copyStateCustomFields(stateCustomFields, stateCustomFieldsList, projectIdTo)
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
  static _copyAttachment (projectIdTo) {
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
   * @param {Array<Object>} customFields
   * @param {Array<Object>} projectCustomFieldsList
   * @param {string|ObjectId} projectIdTo
   * @returns {Promise<void>}
   * @description Copy custom fields.
   */
  static async _copyCustomFields (customFields, projectCustomFieldsList, projectIdTo) {
    await Bluebird.each(customFields, ProjectsLib._copyCustomField(projectIdTo, projectCustomFieldsList))
  }

  /**
   * @private
   * @param {string|ObjectId} projectIdTo
   * @param {Array<Object>} projectCustomFieldsList
   * @returns {function(*): Promise<*>}
   * @description Copy custom field.
   */
  static _copyCustomField (projectIdTo, projectCustomFieldsList) {
    return async (customField) => {
      try {
        const { valueType } = projectCustomFieldsList
          .find((field) => field._id.toString() === customField.customFieldId.toString())

        const props = ['company', 'customFieldId', 'state', 'value']

        const payload = ParamsUtil.destruct(customField, props)

        if (valueType === CustomFieldEnum.ValueType.HASH_SET) {
          payload.operator = 'add'
        }

        await AuthLib.put(`/projects/${projectIdTo}/custom-fields`, payload)
      } catch (error) {
        console.error(error)
      }
    }
  }

  /**
   * @private
   * @param {Array<Object>} stateCustomFields
   * @param {Array<Object>} stateCustomFieldsList
   * @param {string|ObjectId} projectIdTo
   * @returns {Promise<void>}
   * @description Copy state custom fields.
   */
  static async _copyStateCustomFields (stateCustomFields, stateCustomFieldsList, projectIdTo) {
    await Bluebird.each(stateCustomFields, ProjectsLib._copyStateCustomField(projectIdTo, stateCustomFieldsList))
  }

  /**
   * @private
   * @param {string|ObjectId} projectIdTo
   * @param {Array<Object>} stateCustomFieldsList
   * @returns {function(*): Promise<*>}
   * @description Copy state custom field.
   */
  static _copyStateCustomField (projectIdTo, stateCustomFieldsList) {
    return async (customField) => {
      try {
        const { state } = customField
        const { valueType } = stateCustomFieldsList
          .find((field) => field._id.toString() === customField.customFieldId.toString())

        const props = ['company', 'customFieldId', 'value']

        const payload = ParamsUtil.destruct(customField, props)

        if (valueType === CustomFieldEnum.ValueType.HASH_SET) {
          payload.operator = 'add'
        }

        await AuthLib.put(`/projects/${projectIdTo}/states/${state}/custom-fields`, payload)
      } catch (error) {
        console.error(error)
      }
    }
  }
}


module.exports = ProjectsLib
