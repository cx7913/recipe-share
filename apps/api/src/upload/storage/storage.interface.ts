export interface StorageService {
  upload(file: Express.Multer.File, folder: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
  getSignedUrl?(key: string, expiresIn?: number): Promise<string>;
}
