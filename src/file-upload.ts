
import { fromIni } from "https://deno.land/x/aws_sdk@v3.10.0.0/credential-provider-ini/mod.ts";
import {
  S3Client,
  PutObjectCommand,
} from "https://deno.land/x/aws_sdk@v3.10.0.0/client-s3/mod.ts";
import config from "../config.js";


// Set the AWS region
const REGION = config.region;

// Set the bucket parameters
const bucketName = config.bucketName;

// Upload path
const s3Path = config.s3Path;

// Create an S3 client service object
// change the profile as you need
const s3 = new S3Client({
  region: REGION,
  // credentials: fromIni({ profile: "dev" }),
});

const sourceFolderPath = config.uploadFilePath;

function getFilepath(directory: string) {
  let sourceFileList = [];

  // Read source folder and get all file path

  for (const dirEntry of Deno.readDirSync(directory)) {
    let filePath = [directory, dirEntry.name].join('/');
    let stat = Deno.lstatSync(filePath);

    if (stat.isFile) {
      sourceFileList.push(filePath);
    } else if (stat.isDirectory) {
      let subFiles = getFilepath(filePath);
      sourceFileList.concat(subFiles);
    }
  }

  return sourceFileList;
}

function uploadOneByOne() {
  const uploadFileList = getFilepath(sourceFolderPath);

  console.log('Following file(s) will be upload:\n');

  uploadFileList.forEach(name => console.log(name));

  console.log('Start upload');

  uploadNext();

  function uploadNext() {

    let name:string = uploadFileList.shift() || '';
    let keyName = name.split('/').pop();
    let objectParams = {
      Bucket: bucketName,
      Key: [s3Path, keyName].join('/'),
      Body: Deno.readFileSync(name),
      Multipart: false,
    };

    console.log(`Uploading ${objectParams.Key}...`);

    s3.send(new PutObjectCommand(objectParams))
      .then(() => {
        console.log("Successfully uploaded data to " + bucketName + "/" + keyName);

        if (uploadFileList.length > 0) uploadNext();
      })
      .catch(err => { throw err });
  }
}

function uploadTogether() {
  const uploadFileList = getFilepath(sourceFolderPath);

  console.log('Following file(s) will be upload:\n');

  uploadFileList.forEach(name => console.log(name));

  console.log('Start upload');

  let promises:Array<Promise<any>> = [];

  uploadFileList.forEach(name => {
    let keyName = name.split('/').pop();
    let objectParams = {
      Bucket: bucketName,
      Key: [s3Path, keyName].join('/'),
      Body: Deno.readFileSync(name),
      Multipart: false,
    };

    console.log(`Uploading ${objectParams.Key}...`);

    promises.push(
      s3.send(new PutObjectCommand(objectParams))
        .then(() => console.log(`Successfully uploaded data ${objectParams.Key}`))
        .catch(err => { throw err })
    );
  });

  Promise.all(promises)
    .then(() => console.log('All files uploaded.'));
}

const run = () => {

  try {
    console.log(`REGION: ${REGION}`);
    console.log(`BUCKET NAME: ${bucketName}`);
    console.log('\n');

    // uploadOneByOne();
    uploadTogether();
  } catch (err) {
    console.log("Error", err);
  }
};

run();