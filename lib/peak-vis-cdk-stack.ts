import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as path from "path";

export class PeakVisCdkStack extends cdk.Stack {
  readonly bucket: Bucket;
  readonly uploadLambda: Function;
  readonly apiGateway: RestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new Bucket(this, "Omnicept-Data-Bucket", {
      bucketName: "omnicept-data-bucket",
    });
    this.uploadLambda = this.defineUploadLambda();
    this.configureBucketPolicies();
    this.apiGateway = this.defineApiGateway();
    this.configureApiMethods();
  }

  private defineUploadLambda() {
    return new Function(this, "Omnicept-Data-Upload-Function", {
      runtime: Runtime.NODEJS_16_X,
      memorySize: 1024,
      functionName: "omnicept-data-upload-handler",
      timeout: Duration.seconds(60),
      code: Code.fromAsset(path.join(__dirname, "/lambda/")),
      handler: "upload.main",
      environment: {
        BUCKET_NAME: this.bucket.bucketName
      },
    });
  }

  private configureBucketPolicies() {
    this.bucket.grantPut(this.uploadLambda);
    this.bucket.grantReadWrite(this.uploadLambda);
    //this.bucket.grantRead(this.getLambda);
  }

  private defineApiGateway() {
    const apiGateway = new RestApi(this, "Omnicept-Data-Api", {
      description: "Api Gateway for omnicept data lambdas",
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'X-AMZ-Date',
          'Content-Type'
        ],
        allowMethods: ["GET", "POST"],
        allowOrigins: ["*"]
      }
    });
    new CfnOutput(this, "Gateway-Base-Url", {
      value: apiGateway.url
    });
    return apiGateway;
  }

  private configureApiMethods() {
    const dataResource = this.apiGateway.root.addResource("{userId}");
    dataResource.addMethod("POST", new LambdaIntegration(this.uploadLambda, {proxy: true}));
  }
}