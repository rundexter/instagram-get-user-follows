var _ = require('lodash'),
    util = require('./util.js'),
    instagram = require('instagram-node').instagram();

var pickInputs = {
        'userId': 'userId'
    },
    pickOutputs = {
        'id': { key: 'data', fields: ['id'] },
        'full_name': { key: 'data', fields: ['full_name'] },
        'profile_picture': { key: 'data', fields: ['profile_picture'] },
        'username': { key: 'data', fields: ['username'] }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('instagram').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        instagram.use({ access_token: _.get(credentials, 'access_token') });
        instagram.user_follows(inputs.userId || 'self', function (error, result) {

            error? this.fail(error) : this.complete(util.pickOutputs({ data: result }, pickOutputs));
        }.bind(this));
    }
};
