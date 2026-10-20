package com.suman.cloud.file;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FileService {

    private static final Logger log = LoggerFactory.getLogger(FileService.class);

    private final FileRecordRepository fileRecordRepository;

    @Value("${app.aws.region:us-east-1}")
    private String awsRegion;

    @Value("${app.aws.s3-bucket:suman-cloud-storage}")
    private String s3Bucket;

    private S3Client testS3Client;
    private S3Presigner testS3Presigner;

    @Autowired
    public FileService(FileRecordRepository fileRecordRepository) {
        this.fileRecordRepository = fileRecordRepository;
    }

    FileService(FileRecordRepository fileRecordRepository, String awsRegion, String s3Bucket, S3Client s3Client, S3Presigner s3Presigner) {
        this.fileRecordRepository = fileRecordRepository;
        this.awsRegion = awsRegion;
        this.s3Bucket = s3Bucket;
        this.testS3Client = s3Client;
        this.testS3Presigner = s3Presigner;
    }

    public FileRecord uploadFile(Long userId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "unnamed-file";
        }

        String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String objectKey = "users/" + userId + "/" + UUID.randomUUID() + "-" + safeFilename;
        String mimeType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
        String category = classifyCategory(mimeType);

        // Upload to Amazon S3
        uploadToS3(objectKey, file.getBytes(), mimeType);

        // Save metadata in PostgreSQL
        FileRecord record = new FileRecord(userId, originalFilename, category, mimeType, file.getSize(), objectKey);
        return fileRecordRepository.save(record);
    }

    public List<FileRecord> listFiles(Long userId, String category) {
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
            return fileRecordRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category.toUpperCase());
        }
        return fileRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Map<String, String> getPresignedUrl(Long userId, Long fileId) {
        FileRecord record = fileRecordRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new IllegalArgumentException("File not found or unauthorized"));

        String presignedUrl = generatePresignedGetUrl(record.getObjectKey(), null);
        return Map.of("url", presignedUrl);
    }

    public Map<String, String> getDownloadUrl(Long userId, Long fileId) {
        FileRecord record = fileRecordRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new IllegalArgumentException("File not found or unauthorized"));

        String rawFilename = record.getFilename();
        if (rawFilename == null || rawFilename.isBlank()) {
            rawFilename = "download";
        }
        String safeFilename = rawFilename.replace("\r", "").replace("\n", "").replace("\"", "\\\"");
        String disposition = "attachment; filename=\"" + safeFilename + "\"";
        String downloadUrl = generatePresignedGetUrl(record.getObjectKey(), disposition);
        return Map.of("url", downloadUrl);
    }

    public Map<String, String> deleteFile(Long userId, Long fileId) {
        FileRecord record = fileRecordRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new IllegalArgumentException("File not found or unauthorized"));

        // Delete from Amazon S3
        deleteFromS3(record.getObjectKey());

        // Delete metadata from PostgreSQL
        fileRecordRepository.delete(record);
        return Map.of("message", "File deleted successfully");
    }

    private String classifyCategory(String mimeType) {
        String lower = mimeType.toLowerCase();
        if (lower.startsWith("image/")) {
            return "PHOTO";
        } else if (lower.startsWith("video/")) {
            return "VIDEO";
        } else if (lower.startsWith("audio/")) {
            return "AUDIO";
        }
        return "DOCUMENT";
    }

    private void uploadToS3(String objectKey, byte[] data, String contentType) {
        try {
            S3Client client = testS3Client != null ? testS3Client : S3Client.builder().region(Region.of(awsRegion)).build();
            try {
                PutObjectRequest putRequest = PutObjectRequest.builder()
                        .bucket(s3Bucket)
                        .key(objectKey)
                        .contentType(contentType)
                        .build();

                client.putObject(putRequest, RequestBody.fromBytes(data));
                log.info("Uploaded S3 object successfully: s3://{}/{}", s3Bucket, objectKey);
            } finally {
                if (testS3Client == null) {
                    client.close();
                }
            }
        } catch (Exception e) {
            log.error("Failed to upload object to S3 [{}]: {}", objectKey, e.getMessage());
            throw new IllegalStateException("Failed to upload file to S3. Check AWS storage configuration.");
        }
    }

    private String generatePresignedGetUrl(String objectKey, String contentDisposition) {
        try {
            S3Presigner presigner = testS3Presigner != null ? testS3Presigner : S3Presigner.builder().region(Region.of(awsRegion)).build();
            try {
                GetObjectRequest.Builder getObjectRequestBuilder = GetObjectRequest.builder()
                        .bucket(s3Bucket)
                        .key(objectKey);

                if (contentDisposition != null && !contentDisposition.isBlank()) {
                    getObjectRequestBuilder.responseContentDisposition(contentDisposition);
                }

                GetObjectRequest getObjectRequest = getObjectRequestBuilder.build();

                GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofHours(1))
                        .getObjectRequest(getObjectRequest)
                        .build();

                PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
                return presignedRequest.url().toString();
            } finally {
                if (testS3Presigner == null) {
                    presigner.close();
                }
            }
        } catch (Exception e) {
            log.error("Failed to generate presigned S3 URL for [{}]: {}", objectKey, e.getMessage());
            throw new IllegalStateException("Failed to generate file access URL. Check AWS storage configuration.");
        }
    }

    private void deleteFromS3(String objectKey) {
        try {
            S3Client client = testS3Client != null ? testS3Client : S3Client.builder().region(Region.of(awsRegion)).build();
            try {
                DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(s3Bucket)
                        .key(objectKey)
                        .build();

                client.deleteObject(deleteRequest);
                log.info("Deleted S3 object: s3://{}/{}", s3Bucket, objectKey);
            } finally {
                if (testS3Client == null) {
                    client.close();
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete object from S3 [{}]: {}", objectKey, e.getMessage());
            throw new IllegalStateException("Failed to delete file from S3. Check AWS storage configuration.");
        }
    }
}
