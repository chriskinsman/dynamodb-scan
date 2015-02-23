'use strict';

var util = require('util');

var async = require('async');
var AWS = require('aws-sdk');
var _ = require('lodash');
var EventEmitter = require('eventemitter3').EventEmitter;

function DynamoDbScan(awsAccessKeyId, awsSecretAccessKey, awsRegion, table, options) {
    // Events this emits
    var dataEvent = 'data';
    var errorEvent = 'error';
    var throughputExceededEvent = 'throughputexceeded';
    var _awsAccessKeyId = awsAccessKeyId;
    var _awsSecretAccessKey = awsSecretAccessKey;
    var _awsRegion = awsRegion;
    options = options || {};
    var _parallelScans = options.parallelScans || 1;
    var _maxRetries = options.maxRetries || 20;
    var _paused = false;

    // Save off reference to this for later
    var self = this;

    // Call super constructor
    EventEmitter.call(this);

    // Configure dynamoDb
    AWS.config.update({accessKeyId: _awsAccessKeyId, secretAccessKey: _awsSecretAccessKey, region: _awsRegion});
    var dynamodb = new AWS.DynamoDB({maxRetries: _maxRetries});

    function scanTable(segment, callback) {
        var query = {
            TableName: table,
            Segment: segment,
            TotalSegments: _parallelScans
        };

        async.doWhilst(
            function(done) {
                if(!_paused) {
                    dynamodb.scan(query, function (err, data) {
                        if (data) {
                            _.each(data.Items, function (item) {
                                self.emit(dataEvent, item);
                            });

                            // Grab the key to start the next scan on
                            query.ExclusiveStartKey = data.LastEvaluatedKey;
                        }

                        if (err) {
                            // Check for throughput exceeded
                            if (err.code && err.code == "ProvisionedThroughputExceededException") {
                                self.emit(throughputExceededEvent);
                                // Wait at least one second before the next query
                                return setTimeout(done, 1000);
                            }
                            else {
                                self.emit(errorEvent, err);
                                return done(err);
                            }
                        }
                        else {
                            return done(null);
                        }
                    });
                }
                else {
                    console.info("Paused");
                    return setTimeout(done, 1000);
                }
            },
            function() {
                return query.ExclusiveStartKey;
            },
            callback
        );
    }

    this.start = function() {
        var parallelScanFunctions = [];
        for(var i = 0; i < _parallelScans; i++)
        {
            parallelScanFunctions.push(
                function(segment) {
                    return function(done) {
                        scanTable(segment, done);
                    };
                }(i)
            );
        }

        async.parallel(parallelScanFunctions, function(err) {
            self.emit('finish');
        });
    };

    this.pause = function() {
        console.info("Pausing");
        _paused = true;
    };

    this.resume = function() {
        console.info("Resuming");
        _paused = false;
    };

    return (this);
}

util.inherits(DynamoDbScan, EventEmitter);

module.exports = DynamoDbScan;