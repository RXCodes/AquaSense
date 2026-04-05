import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
export const Database = {
  upload_text,
  upload_binary,
  read_text,
  delete_path,
  delete_directory
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
        console.log("Cannot read from database: " + path);
        console.log("Failed to read from database: " + err);
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
      Key: path,
      DeleteMarker: true
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

// upload binary data (e.g. images) to the database
function upload_binary(path, buffer, content_type) {
  return new Promise((resolve) => {
    const s3 = s3_client();
    const bucket = process.env.s3_bucket_name;
    const params = new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: buffer,
      ContentType: content_type,
    });
    s3.send(params, (err, _) => {
      if (err) {
        console.log("Cannot upload binary to database: " + path);
        console.log("Failed to upload binary to database: " + err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// remove a directory from the database
function delete_directory(prefix) {
  return new Promise(async (resolve) => {
  const s3 = s3_client();
  const bucket = process.env.s3_bucket_name;
  try {
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix
    }));
    if (!list.Contents || list.Contents.length === 0) {
      resolve(true);
      return;
    }
    const objects = list.Contents.map(obj => ({ Key: obj.Key }));
    await s3.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: objects }
    }));
    resolve(true)
  } catch (err) {
    console.log("Failed to delete directory:", err);
    resolve(false);
  }
  });
}