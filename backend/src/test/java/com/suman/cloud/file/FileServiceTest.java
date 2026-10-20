package com.suman.cloud.file;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private FileRecordRepository fileRecordRepository;

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    private FileService fileService;

    @BeforeEach
    void setUp() {
        fileService = new FileService(fileRecordRepository, "us-east-1", "test-bucket", s3Client, s3Presigner);
    }

    @Test
    @DisplayName("Should classify image as PHOTO and save record to S3 and database")
    void shouldClassifyImageAsPhoto() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", "image-content".getBytes()
        );

        when(fileRecordRepository.save(any(FileRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FileRecord record = fileService.uploadFile(1L, file);

        assertThat(record.getCategory()).isEqualTo("PHOTO");
        assertThat(record.getFilename()).isEqualTo("photo.jpg");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
        verify(fileRecordRepository).save(any(FileRecord.class));
    }

    @Test
    @DisplayName("Should classify mp4 as VIDEO and mp3 as AUDIO")
    void shouldClassifyMediaCategories() throws IOException {
        MockMultipartFile videoFile = new MockMultipartFile(
                "file", "clip.mp4", "video/mp4", "video-content".getBytes()
        );
        MockMultipartFile audioFile = new MockMultipartFile(
                "file", "song.mp3", "audio/mpeg", "audio-content".getBytes()
        );

        when(fileRecordRepository.save(any(FileRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FileRecord videoRecord = fileService.uploadFile(1L, videoFile);
        FileRecord audioRecord = fileService.uploadFile(1L, audioFile);

        assertThat(videoRecord.getCategory()).isEqualTo("VIDEO");
        assertThat(audioRecord.getCategory()).isEqualTo("AUDIO");
        verify(s3Client, times(2)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    @DisplayName("Should fail when S3 upload fails and not persist metadata")
    void shouldFailWhenS3Fails() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "bad.jpg", "image/jpeg", "corrupt".getBytes()
        );
        doThrow(new RuntimeException("S3 Connection Error"))
                .when(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));

        assertThatThrownBy(() -> fileService.uploadFile(1L, file))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to upload file to S3");

        verify(fileRecordRepository, never()).save(any(FileRecord.class));
    }

    @Test
    @DisplayName("Should classify document and list files by user")
    void shouldClassifyDocumentAndListFiles() throws IOException {
        MockMultipartFile pdf = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "pdf-content".getBytes()
        );
        when(fileRecordRepository.save(any(FileRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FileRecord record = fileService.uploadFile(1L, pdf);
        assertThat(record.getCategory()).isEqualTo("DOCUMENT");

        when(fileRecordRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(record));

        List<FileRecord> list = fileService.listFiles(1L, null);
        assertThat(list).hasSize(1);
        assertThat(list.get(0).getFilename()).isEqualTo("doc.pdf");
    }

    @Test
    @DisplayName("Should generate real presigned URL from S3 presigner")
    void shouldGeneratePresignedUrl() throws Exception {
        FileRecord record = new FileRecord(1L, "notes.txt", "DOCUMENT", "text/plain", 100L, "users/1/notes.txt");
        record.setId(5L);

        when(fileRecordRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(record));

        PresignedGetObjectRequest presignedRequest = mock(PresignedGetObjectRequest.class);
        when(presignedRequest.url()).thenReturn(new URI("https://test-bucket.s3.us-east-1.amazonaws.com/users/1/notes.txt").toURL());
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedRequest);

        var response = fileService.getPresignedUrl(1L, 5L);

        assertThat(response.get("url")).contains("test-bucket");
    }

    @Test
    @DisplayName("Should generate download URL with attachment Content-Disposition and 1-hour expiry")
    void shouldGenerateDownloadUrlWithAttachmentContentDisposition() throws Exception {
        FileRecord record = new FileRecord(1L, "report-2026.pdf", "DOCUMENT", "application/pdf", 2048L, "users/1/report-2026.pdf");
        record.setId(12L);

        when(fileRecordRepository.findByIdAndUserId(12L, 1L)).thenReturn(Optional.of(record));

        PresignedGetObjectRequest presignedRequest = mock(PresignedGetObjectRequest.class);
        when(presignedRequest.url()).thenReturn(new URI("https://test-bucket.s3.us-east-1.amazonaws.com/users/1/report-2026.pdf?response-content-disposition=attachment").toURL());
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedRequest);

        var response = fileService.getDownloadUrl(1L, 12L);

        assertThat(response.get("url")).contains("test-bucket");

        ArgumentCaptor<GetObjectPresignRequest> captor = ArgumentCaptor.forClass(GetObjectPresignRequest.class);
        verify(s3Presigner).presignGetObject(captor.capture());
        GetObjectPresignRequest presignRequestValue = captor.getValue();

        assertThat(presignRequestValue.signatureDuration()).isEqualTo(java.time.Duration.ofHours(1));
        assertThat(presignRequestValue.getObjectRequest().responseContentDisposition())
                .isEqualTo("attachment; filename=\"report-2026.pdf\"");
        assertThat(presignRequestValue.getObjectRequest().key()).isEqualTo("users/1/report-2026.pdf");
    }

    @Test
    @DisplayName("Should handle filenames with spaces and quotes safely in Content-Disposition")
    void shouldHandleFilenamesWithSpacesAndQuotesInDownloadUrl() throws Exception {
        FileRecord record = new FileRecord(1L, "My Vacation \"Photo\" 2026.png", "PHOTO", "image/png", 4096L, "users/1/vacation.png");
        record.setId(15L);

        when(fileRecordRepository.findByIdAndUserId(15L, 1L)).thenReturn(Optional.of(record));

        PresignedGetObjectRequest presignedRequest = mock(PresignedGetObjectRequest.class);
        when(presignedRequest.url()).thenReturn(new URI("https://test-bucket.s3.us-east-1.amazonaws.com/users/1/vacation.png").toURL());
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedRequest);

        var response = fileService.getDownloadUrl(1L, 15L);
        assertThat(response.get("url")).isNotEmpty();

        ArgumentCaptor<GetObjectPresignRequest> captor = ArgumentCaptor.forClass(GetObjectPresignRequest.class);
        verify(s3Presigner).presignGetObject(captor.capture());

        assertThat(captor.getValue().getObjectRequest().responseContentDisposition())
                .isEqualTo("attachment; filename=\"My Vacation \\\"Photo\\\" 2026.png\"");
    }

    @Test
    @DisplayName("Should reject download URL if file does not belong to user")
    void shouldRejectDownloadUrlForUnauthorizedFile() {
        when(fileRecordRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.getDownloadUrl(1L, 99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File not found or unauthorized");
    }

    @Test
    @DisplayName("Should delete S3 object and database metadata")
    void shouldDeleteFile() {
        FileRecord record = new FileRecord(1L, "notes.txt", "DOCUMENT", "text/plain", 100L, "users/1/notes.txt");
        record.setId(5L);

        when(fileRecordRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(record));

        fileService.deleteFile(1L, 5L);

        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
        verify(fileRecordRepository).delete(record);
    }
}
