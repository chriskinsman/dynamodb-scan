# dynamodb-scan

  [![Travis Build][travis-image]][travis-url]
  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]

EventEmitter to simplify dynamodb parallel scans

## Features
  * EventEmitter pattern for dynamodb scan
  * Data event emitted for each record
  * Supports pause/resume of emitter
  * DynamoDb parallel scans supported

## Installation

``` bash
  $ npm install dynamodb-scan --save
```

## Usage

```js
'use strict';

var DynamoDbScan = require('dynamodb-scan');


var dynamoDbScan = new DynamoDbScan('awsAccessKey', 'awsSecret', 'awsRegion', 'tableName');

var count = 0;

dynamoDbScan.on('data', function(item) {
    count++;
    console.dir(item);

    if(count === 10)
    {
        dynamoDbScan.pause();

        setTimeout(function() {
            dynamoDbScan.resume();
        }, 5000);
    }
});

dynamoDbScan.on('finish', function() {
    console.info('Finish');
    process.exit(0);
});

dynamoDbScan.start();
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

[npm-image]: https://img.shields.io/npm/v/dynamodb-scan.svg?style=flat
[npm-url]: https://npmjs.org/package/dynamodb-scan
[downloads-image]: https://img.shields.io/npm/dm/dynamodb-scan.svg?style=flat
[downloads-url]: https://npmjs.org/package/dynamodb-scan
[travis-image]: https://img.shields.io/travis/chriskinsman/dynamodb-scan.svg
[travis-url]: https://travis-ci.org/chriskinsman/dynamodb-scan
