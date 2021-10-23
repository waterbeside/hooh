const inquirer = require('inquirer')

const defaultPrompts = {
  'name': {
    'type': 'string',
    'message': 'Project name'
  },
  'description': {
    'type': 'string',
    'message': 'Project description',
    'default': 'application created by HOOH'
  },
  'author': {
    'type': 'string',
    'message': 'Author'
  },
}

module.exports = function(options) {
  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata()
    const defaultProjectName = options.projectName || 'Project name'
    const prompts = {
      ...defaultPrompts,
      name: {
        ...defaultPrompts.name,
        default: defaultProjectName
      }}
    inquirer
      .prompt(prompts)
      .then(saveAnswersToMetadata(metadata, options, done))
  }
}

function saveAnswersToMetadata(metadata, options, done) {
  return answers => {
    for (var key in answers) {
      metadata[key] = answers[key]
    }
    done()
  }
}

