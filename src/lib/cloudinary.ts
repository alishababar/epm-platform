import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadFile(fileBuffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string; public_id: string; bytes: number }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
          });
        }
      );
      stream.end(fileBuffer);
    }
  );
}

export async function deleteFile(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
