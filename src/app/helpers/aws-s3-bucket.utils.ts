import aws from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { DeleteObjectRequest } from "aws-sdk/clients/s3";
import path from "path";
import CONFIGURATIONS from "@/configurations/configurations";

aws.config.update({
  accessKeyId: CONFIGURATIONS.S3.ACCESS_KEY_ID,
  secretAccessKey: CONFIGURATIONS.S3.SECRET_ACCESS_KEY,
  region: CONFIGURATIONS.S3.REGION,
});

const s3 = new aws.S3();

export const uploadToS3 = async (
  buffer: Buffer,
  fileName: string,
  folderPath: string
): Promise<string> => {
  const key = `${folderPath}/${uuidv4()}`;

  // Determine content type based on file extension
  const contentType = getContentType(fileName);

  // Check if the bucket name is defined in the configuration
  if (!CONFIGURATIONS.S3.BUCKET_NAME) {
    throw new Error("S3 bucketName is not defined in the configuration");
  }
  await s3
    .upload({
      Bucket: CONFIGURATIONS.S3.BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
    .promise();
  return key;
};

// Function to get content type based on file extension
const getContentType = (fileName: string): string => {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
    case ".docx":
      return "application/msword";
    case ".ppt":
    case ".pptx":
      return "application/vnd.ms-powerpoint";
    case ".xls":
    case ".xlsx":
      return "application/vnd.ms-excel";
    case ".mp4":
      return "video/mp4";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream"; // Default content type
  }
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  // Check if the bucket name is defined in the configuration
  if (!CONFIGURATIONS.S3.BUCKET_NAME) {
    throw new Error("S3 bucketName is not defined in the configuration");
  }
  await s3
    .deleteObject({
      Bucket: CONFIGURATIONS.S3.BUCKET_NAME,
      Key: key,
    })
    .promise();
};

export const deleteMultipleFromS3 = async (keys: string[]): Promise<void> => {
  // Check if the bucket name is defined in the configuration
  const bucketName = CONFIGURATIONS.S3.BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3 bucketName is not defined in the configuration");
  }
  // Use Promise.all to perform parallel deletion of objects
  await Promise.all(
    keys.map(async (key) => {
      const params: DeleteObjectRequest = {
        Bucket: bucketName,
        Key: key,
      };
      try {
        await s3.deleteObject(params).promise();
        console.log(`File ${key} deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting file ${key} from S3:`, error);
        throw error;
      }
    })
  );
};

// export const generateS3FileUrl = (key: string): string => {
//   // Check if the bucket name is defined in the configuration
//   const bucketName = CONFIGURATIONS.S3.BUCKET_NAME;
//   if (!bucketName) {
//     throw new Error("S3 bucketName is not defined in the configuration");
//   }
//   // Generate the S3 file URL
//   const s3FileUrl = `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(
//     key
//   )}`;
//   return s3FileUrl;
// };

export const generateS3FileUrl = (key: string): string => {
  // Check if the bucket name is defined in the configuration
  const bucketName = CONFIGURATIONS.S3.BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3 bucketName is not defined in the configuration");
  }
  // Generate the S3 file URL without encoding the key
  const s3FileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
  return s3FileUrl;
};
