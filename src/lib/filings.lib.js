class FilingsLib {
  /**
   * @param {string|ObjectId} projectIdFrom
   * @param {string|ObjectId} projectIdTo
   * @param {string|ObjectId} productId
   * @returns {Promise<void>}
   * @description Move filings to project.
  */
  static async _moveFilingsToProject (projectIdFrom, projectIdTo, productId) {
    const payload = {
      filters: [{ field: 'projectIds', comparisonOperator: 'in', value: [projectIdFrom] }],
      payload: { productId, projectIdTo }
    }

    await AuthLib.patch('/filings/containers', payload)
  }
}

module.exports = FilingsLib
