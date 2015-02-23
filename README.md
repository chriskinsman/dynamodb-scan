# DynamoDbScan

EventEmitter to simplify dynamodb parallel scans

## Features
  * EventEmitter pattern for dynamodb scan
  * Data event emitted for each record
  * Supports pause/resume of emitter
  * DynamoDb parallel scans supported

## Installation

``` bash
  $ npm install DynamoDbScan --save
```

## Usage

```js
'use strict';

var DynamodbScan = require('DynamoDbScan');


var dynamodbScan = new DynamodbScan('awsAccessKey', 'awsSecret', 'awsRegion', 'tableName');

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
```

Parallel Scans are useful to maximize usage of throughput provisioned on the DynamoDb table.

## Documentation

### new DynamoDbScan(awsAccessKeyId, awsSecretAccessKey, awsRegion, tableName, options)

Sets up the AWS credentials to use

__Arguments__

* `awsAccessKeyId` - AWS access key
* `awsSecretAccessKey` - AWS secret
* `awsRegion` - AWS region
* `tableName` - Name of table to scan
* `options` - Options
    - `parallelScans` - Number of parallel scans to run.  Defaults to 1
    - `maxRetries` - Number of times to retry a failed dynamo db operation.  Passed to aws-sdk.

### start()

Starts the scan.  Method available so you can hook up your listeners before it starts emitting events.

### pause()

Pauses a scan.  Events may still be emitted from the previous scan operation.

### resume()

Resumes a paused scan.

## People

The author is [Chris Kinsman](https://github.com/chriskinsman) from [PushSpring](http://www.pushspring.com)

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/dynamodbscan.svg?style=flat
[npm-url]: https://npmjs.org/package/dynamodbscan
[downloads-image]: https://img.shields.io/npm/dm/dynamodbscan.svg?style=flat
[downloads-url]: https://npmjs.org/package/dynamodbscan