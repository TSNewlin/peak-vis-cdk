import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as PeakVisCdk from '../lib/peak-vis-cdk-stack';
import {CfnElement} from "aws-cdk-lib";

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

test('Lambda Function for listing uploads in folder created', () => {
  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: "omnicept-data-folder-list-handler",
    Timeout: 60,
    Handler: "list.main"
  });
});

test('Lambda Function for getting single file created', () => {
  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: "omnicept-data-get-file-handler",
    Timeout: 60,
    Handler: "get.main"
  });
});

test('Stack contains Api Gateway', () => {
  template.hasResourceProperties("AWS::ApiGateway::RestApi", {});
});

test('ApiGateway has data resource', () => {
  template.findResources('AWS::ApiGateway::Resource');
});

test('ApiGateway has POST method for data', () => {
  template.hasResourceProperties("AWS::ApiGateway::Method", {
    HttpMethod: "POST"
  });
});

test('ApiGateway has upload request validator', () => {
  template.hasResourceProperties("AWS::ApiGateway::RequestValidator", {
    ValidateRequestBody: true,
    Name: "upload-request-validator"
  });
});

test('ApiGateway has upload request body validation model', () => {
  template.hasResourceProperties("AWS::ApiGateway::Model", {
    ContentType: "application/json",
    Name: "DataUploadModel",
  })
});

test("ApiGateway has GET method to list objects in a folder", () => {
  template.hasResourceProperties("AWS::ApiGateway::Method", {
    HttpMethod: "GET"
  });
});

test('ApiGateway has sub resource for single file requests', () => {
  const logicalId = stack.getLogicalId(stack.apiGateway.node.findChild('Resource') as CfnElement);
  template.hasResourceProperties("AWS::ApiGateway::Resource", {
    ParentId: {
      "Fn::GetAtt": [
          logicalId,
          'RootResourceId'
      ],
    },
    RestApiId: {
      Ref: logicalId
    }
  })
});
