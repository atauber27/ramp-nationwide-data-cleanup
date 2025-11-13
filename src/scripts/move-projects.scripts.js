const mapping = require('../data/mapping')

const { ProjectsLib } = require('../lib')
const Bluebird = require('bluebird')

class MoveProjects {
  static async run() {
    await Bluebird.each(mapping, ProjectsLib.moveProjectToProduct())
  }
}

module.exports = MoveProjects.run().catch(console.error)