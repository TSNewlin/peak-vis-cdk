import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { User, AccessKey } from 'aws-cdk-lib/aws-iam'
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class PeakVisCdkStack extends cdk.Stack {
  readonly bucket: Bucket;
  readonly iamUploadUser: User;
  readonly iamGetUser: User;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new Bucket(this, "Omnicept-Data-Bucket", {
      bucketName: "omnicept-data-bucket",
    });

    this.iamUploadUser = new User(this, "Omnicept-Data-Bucket-Write-User", {userName: "OmniceptDataUploadUser"});
    this.iamGetUser = new User(this, "Omnicept-Data-Bucket-Read-User", {userName: "OmniceptDataViewUser"});
    this.provisionAccessKeys();
    this.configureBucketPolicies();
  }

  private provisionAccessKeys() {
    const uploadUserAccessKey = new AccessKey(this, "Omnicept-Data-Bucket-Write-User-Key", {
      user: this.iamUploadUser
    });
    const getUserAccessKey = new AccessKey(this, "Omnicept-Data-Bucket-Read-User-Key", {
      user: this.iamGetUser
    });
    new Secret(this, "Omnicept-Data-Bucket-Read-User-Secret", {
      secretStringValue: getUserAccessKey.secretAccessKey
    });
    new Secret(this, "Omnicept-Data-Bucket-Write-User-Secret", {
      secretStringValue: uploadUserAccessKey.secretAccessKey,
    });
  }

  private configureBucketPolicies() {
    this.bucket.grantPut(this.iamUploadUser);
    this.bucket.grantWrite(this.iamUploadUser);
    this.bucket.grantRead(this.iamGetUser);
  }
}
