class CustomFieldsUtil {
  /**
   * @returns {Object}
   * @description Get custom fields.
   */
  static async getCustomFields() {
    return {
      projectCustomFields: CustomFieldsUtil._getProjectCustomFields(),
      stateCustomFields: CustomFieldsUtil._getStateCustomFields()
    }
  }

  /**
   * @private
   * @returns {Object}
   * @description Get project custom fields.
   */
  static async _getProjectCustomFields () {
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
   * @description Get state custom fields.
   */
  static async _getStateCustomFields () {
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
