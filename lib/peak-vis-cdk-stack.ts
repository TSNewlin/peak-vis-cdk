import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { JsonSchemaType, LambdaIntegration, Model, RequestValidator, RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as path from "path";

export class PeakVisCdkStack extends cdk.Stack {
  readonly bucket: Bucket;
  readonly uploadLambda: Function;
  readonly listLambda: Function;
  readonly getSingleFileLambda: Function;
  readonly apiGateway: RestApi;
  readonly uploadRequestValidator: RequestValidator;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new Bucket(this, "Omnicept-Data-Bucket", {
      bucketName: "omnicept-data-bucket",
    });
    this.uploadLambda = this.defineLambda({
      id: "Omnicept-Data-Upload-Function", 
      functionName: "omnicept-data-upload-handler", 
      handler: "upload.main"
    });
    this.listLambda = this.defineLambda({
      id: "Omnicept-Folder-List-Objects-Function",
      functionName: "omnicept-data-folder-list-handler",
      handler: "list.main"
    });
    this.getSingleFileLambda = this.defineLambda({
      id: "Omnicept-Get-Single-FIle-Lambda",
      functionName: "omnicept-data-get-file-handler",
      handler: "get.main"
    });
    this.configureBucketPolicies();
    this.apiGateway = this.defineApiGateway();
    this.configureApiMethods();
  }

  private defineLambda(lambdaProps: {id: string, functionName: string, handler: string}) {
    return new Function(this, lambdaProps.id, {
      runtime: Runtime.NODEJS_16_X,
      memorySize: 1024,
      timeout: Duration.seconds(60),
      code: Code.fromAsset(path.join(__dirname, "/lambda/")),
      environment: {
        BUCKET_NAME: this.bucket.bucketName,
        BUCKET_REGION: this.region,
      },
      functionName: lambdaProps.functionName,
      handler: lambdaProps.handler,
    });
  }

  private configureBucketPolicies() {
    this.bucket.grantPut(this.uploadLambda);
    this.bucket.grantReadWrite(this.uploadLambda);
    this.bucket.grantRead(this.listLambda);
    this.bucket.grantRead(this.getSingleFileLambda);
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
    const rootResource = this.apiGateway.root.addResource("{userId}");
    rootResource.addMethod("POST", new LambdaIntegration(this.uploadLambda, {proxy: true}), {
      requestValidator: this.defineUploadRequestValidator(),
      requestModels: {"application/json": this.defineUploadRequestModel()},
    });

    rootResource.addMethod("GET", new LambdaIntegration(this.listLambda, {proxy: true}));

    const singleFileResource = rootResource.addResource("{fileName}");
    singleFileResource.addMethod("GET", new LambdaIntegration(this.getSingleFileLambda, {proxy: true}));
  }

  private defineUploadRequestValidator() {
    return new RequestValidator(this, 'Api-Gateway-Upload-Request-Validator', {
      restApi: this.apiGateway,
      validateRequestBody: true,
      requestValidatorName: "upload-request-validator",
    });
  }

  private defineUploadRequestModel() {
    return new Model(this, 'Api-Gateway-Upload-Request-Model', {
      restApi: this.apiGateway,
      contentType: "application/json",
      modelName: "DataUploadModel",
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          heartRateValues: {type: JsonSchemaType.ARRAY},
          eyeTrackingValues: {type: JsonSchemaType.ARRAY},
          cognitiveLoadValues: {type: JsonSchemaType.ARRAY},
          heartRateVariabilityValues: {type: JsonSchemaType.ARRAY}
        }
      }
    });
  }
}