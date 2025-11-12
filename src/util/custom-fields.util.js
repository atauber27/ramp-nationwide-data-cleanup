const { AuthLib } = require("../lib")

class CustomFieldsUtil {
  /**
   * @returns {Object}
   * @description Get custom fields list.
   */
  static async getCustomFieldsList() {
    const projectCustomFieldsList = await CustomFieldsUtil._getProjectCustomFieldsList()
    const stateCustomFieldsList = await CustomFieldsUtil._getStateCustomFieldsList()

    return { projectCustomFieldsList, stateCustomFieldsList }
  }

  /**
   * @private
   * @returns {Object}
   * @description Get project custom fields list.
   */
  static async _getProjectCustomFieldsList () {
    const customFields = []
    let offset = 0

    while (true) {
      const { data: _customFields } = await AuthLib
        .get(`/custom-fields?type=PROJECT&limit=${CustomFieldsUtil._LIMIT}&offset=${offset}`)

      customFields.push(..._customFields)
      if (customFields.length < CustomFieldsUtil._LIMIT) {
        break
      }

      offset += CustomFieldsUtil._LIMIT
    }

    return customFields
  }

  /**
   * @private
   * @returns {Object}
   * @description Get state custom fields list.
   */
  static async _getStateCustomFieldsList () {
    const customFields = []
    let offset = 0

    while (true) {
      const { data: _customFields } = await AuthLib
        .get(`/custom-fields?type=PROJECT_STATE&limit=${CustomFieldsUtil._LIMIT}&offset=${offset}`)

      customFields.push(..._customFields)
      if (customFields.length < CustomFieldsUtil._LIMIT) {
        break
      }

      offset += CustomFieldsUtil._LIMIT
    }

    return customFields
  }
}

CustomFieldsUtil._LIMIT = 100

module.exports = CustomFieldsUtil
