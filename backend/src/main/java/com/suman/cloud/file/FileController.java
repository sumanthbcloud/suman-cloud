package com.suman.cloud.file;

import com.suman.cloud.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping
    public ResponseEntity<FileRecord> uploadFile(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(fileService.uploadFile(user.id(), file));
    }

    @GetMapping
    public ResponseEntity<List<FileRecord>> listFiles(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(value = "category", required = false) String category) {
        return ResponseEntity.ok(fileService.listFiles(user.id(), category));
    }

    @GetMapping("/{id}/url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(fileService.getPresignedUrl(user.id(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFile(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(fileService.deleteFile(user.id(), id));
    }
}
