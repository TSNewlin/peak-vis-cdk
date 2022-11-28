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

test('IAM user for bucket uploads created', () => {
    template.hasResourceProperties('AWS::IAM::User', {
        UserName: "OmniceptDataUploadUser"
    });
});

test('IAM user for reading s3 data created', () => {
    template.hasResourceProperties('AWS::IAM::User', {
        UserName: "OmniceptDataViewUser"
    })
});