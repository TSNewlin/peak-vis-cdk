import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as PeakVisCdk from '../lib/peak-vis-cdk-stack';

const app = new cdk.App();
const stack = new PeakVisCdk.PeakVisCdkStack(app, 'TestStack');
const template = Template.fromStack(stack);

test('S3 bucket created', () => {
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: "omnicept-data-bucket"
  });
}); 

test('Lambda Function for bucket uploads created', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: "omnicept-data-upload-handler",
        Timeout: 60,
        Handler: "upload.main",
    });
});

test('Stack contains Api Gateway', () => {
  template.hasResourceProperties("AWS::ApiGateway::RestApi", {});
});

test('ApiGateway has data resource', () => {
  template.findResources('AWS::ApiGateway::Resource');
});

test('ApiGateway has Post method for data', () => {
  template.hasResourceProperties("AWS::ApiGateway::Method", {
    HttpMethod: "POST"
  });
});