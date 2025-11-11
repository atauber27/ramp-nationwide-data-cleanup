class CustomFieldsUtil {
  /**
   * @returns {Object}
   * @description Get custom fields list.
   */
  static async getCustomFieldsList() {
    return {
      projectCustomFieldsList: CustomFieldsUtil._getProjectCustomFieldsList(),
      stateCustomFieldsList: CustomFieldsUtil._getStateCustomFieldsList()
    }
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
      const _customFields = await AuthLib
        .get(`/custom-fields?type=PROJECT&limit=${CustomFieldsUtil._LIMIT}&offset=${offset}`)

      customFields.push(..._customFields)
      if (customFields.length < limit) {
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
      const _customFields = await AuthLib
        .get(`/custom-fields?type=PROJECT_STATE&limit=${CustomFieldsUtil._LIMIT}&offset=${offset}`)

      customFields.push(..._customFields)
      if (customFields.length < limit) {
        break
      }

      offset += CustomFieldsUtil._LIMIT
    }

    return customFields
  }
}

CustomFieldsUtil._LIMIT = 100

module.exports = CustomFieldsUtil
