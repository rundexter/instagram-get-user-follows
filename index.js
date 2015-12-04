var _ = require('lodash');
var ig = require('instagram-node').instagram();

var globalPickResult = {
    users: {
        key: 'users',
        fields: {
            id: 'id',
            full_name: 'full_name',
            profile_picture: 'profile_picture',
            username: 'username'
        }
    }
};

module.exports = {

    /**
     * Return pick result.
     *
     * @param output
     * @param pickResult
     * @returns {*}
     */
    pickResult: function (output, pickResult) {
        var result = {};

        _.map(_.keys(pickResult), function (resultVal) {

            if (_.has(output, resultVal)) {

                if (_.isObject(pickResult[resultVal])) {
                    if (_.isArray(_.get(output, resultVal))) {

                        if (!_.isArray(result[pickResult[resultVal].key])) {
                            result[pickResult[resultVal].key] = [];
                        }

                        _.map(_.get(output, resultVal), function (inOutArrayValue) {

                            result[pickResult[resultVal].key].push(this.pickResult(inOutArrayValue, pickResult[resultVal].fields));
                        }, this);
                    } else if (_.isObject(_.get(output, resultVal))){

                        result[pickResult[resultVal].key] = this.pickResult(_.get(output, resultVal), pickResult[resultVal].fields);
                    }
                } else {
                    _.set(result, pickResult[resultVal], _.get(output, resultVal));
                }
            }
        }, this);

        return result;
    },

    /**
     * Set acess token.
     *
     * @param dexter
     * @param spotifyApi
     */
    authParams: function (dexter, spotifyApi) {

        if (dexter.environment('spotify_access_token')) {

            spotifyApi.setAccessToken(dexter.environment('spotify_access_token'));
        }
    },

    prepareStringInputs: function (inputs) {
        var result = {};

        _.map(inputs, function (inputValue, inputKey) {

            result[inputKey] = _(inputValue).toString();
        });

        return result;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var userId = step.input('userId').first() || 'self';

        ig.use({ access_token: dexter.environment('instagram_access_token') });

        ig.user_follows(userId, function (err, result) {

            if (err) {

                this.fail(err);
            } else {

                this.complete(this.pickResult({users: result}, globalPickResult));
            }
        }.bind(this));
    }
};
