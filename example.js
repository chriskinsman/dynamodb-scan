'use strict';

var DynamodbScan = require('./index');


var dynamodbScan = new DynamodbScan('awsAccessKey', 'awsSecret', 'awsRegion', 'tableName', {parallelScans: 5});

var count = 0;

dynamodbScan.on('data', function(item) {
    count++;
    console.dir(item);

    if(count === 10)
    {
        dynamodbScan.pause();

        setTimeout(function() {
            dynamodbScan.resume();
        }, 5000);
    }
});

dynamodbScan.on('finish', function() {
    console.info('Finish');
    process.exit(0);
});

dynamodbScan.start();