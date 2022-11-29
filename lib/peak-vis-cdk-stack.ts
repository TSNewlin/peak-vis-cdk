import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Code, Function, FunctionUrlAuthType, Runtime, FunctionUrlCorsOptions } from 'aws-cdk-lib/aws-lambda';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import * as path from "path";

export class PeakVisCdkStack extends cdk.Stack {
  readonly bucket: Bucket;
  readonly uploadLambda: Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new Bucket(this, "Omnicept-Data-Bucket", {
      bucketName: "omnicept-data-bucket",
    });
    this.uploadLambda = this.defineUploadLambda();
    this.configureBucketPolicies();
  }

  private defineUploadLambda() {
    const uploadFunction = new Function(this, "Omnicept-Data-Upload-Function", {
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

    const url = uploadFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "Upload-Lambda-Url", {
      value: url.url,
    });

    return uploadFunction;
  }

  private configureBucketPolicies() {
    this.bucket.grantPut(this.uploadLambda);
    this.bucket.grantReadWrite(this.uploadLambda);
    //this.bucket.grantRead(this.getLambda);
  }
}