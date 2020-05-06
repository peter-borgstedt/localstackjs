export const PORTS = {
  apigateway: 4567,
  kinesis: 4568,
  dynamodb: 4569,
  dynamodbstreams: 4570,
  s3: 4572,
  firehose: 4573,
  lambda: 4574,
  sns: 4575,
  sqs: 4576,
  redshift: 4577,
  es: 4578,
  ses: 4579,
  route53: 4580,
  cloudformation: 4581,
  cloudwatch: 4582,
  ssm: 4566, // depricated: 4583
  secretsmanager: 4584,
  stepfunctions: 4585,
  logs: 4586, // CloudWatch Logs
  events: 4587, // EventBridge (CloudWatch Events)
  sts: 4592,
  iam: 4593,
  ec2: 4597,
  kms: 4599
};

export const CONTAINER_NAME = 'localstack';
export const IMAGE_NAME = 'localstack/localstack:latest';

export const PREFIX = ' \u2022';

