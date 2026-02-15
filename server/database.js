import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
export const Database = {
  upload_text,
  read_text,
  delete_path
};

// instantiate an s3 client used in all requests for s3 services
function s3_client() {
  const s3 = new S3Client({
    region: process.env.s3_region,
    endpoint: process.env.s3_endpoint,
    forcePathStyle: true,
    sslEnabled: true,
    credentials: {
      accessKeyId: process.env.s3_access_key_id,
      secretAccessKey: process.env.s3_secret_access_key,
    }
  });
  return s3;
}

// upload text to the database
function upload_text(path, text) {
  return new Promise(async (resolve) => {
    // upload the text file to the database
    const s3 = s3_client();
    const bucket = process.env.s3_bucket_name;
    const params = new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: text,
      ContentType: "text/plain"
    });
    s3.send(params, (err, _) => {
      if (err) {
        console.log("Cannot upload to database: " + path);
        console.log("Failed to upload text to database: " + err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// read text from the database
function read_text(path, default_value) {
  return new Promise(async (resolve) => {
    
    // read the text file from the database
    const s3 = s3_client();
    const bucket = process.env.s3_bucket_name;
    const params = new GetObjectCommand({
      Bucket: bucket,
      Key: path,
      ResponseContentType: "text/plain"
    });
    s3.send(params, async (err, data) => {
      if (err) {
        if (err.Code == "NoSuchKey") {
          resolve({"success": true, "text": default_value});
          return;
        }
        resolve({"success": false, "error": err});
      } else {
        // read the file - it comes in chunks, so we need to concatenate them
        var content = "";
        for await (const chunk of data.Body) {
          content += chunk;
        }
        resolve({"success": true, "text": content});
      }
    });
  });
}

// remove a file from the database
function delete_path(path) {
  return new Promise((resolve) => {
    const s3 = s3_client();
    const bucket = process.env.s3_bucket_name;
    const params = new DeleteObjectCommand({
      Bucket: bucket,
      Key: path
    });
    s3.send(params, async (err, _) => {
      if (err) {
        console.log("Cannot delete from database: " + path);
        console.log("Failed to delete from database: " + err);
        resolve(false);
      } else {
        resolve(true);
      }
    })
  });
}
