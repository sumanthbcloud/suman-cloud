package com.suman.cloud.file;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRecordRepository extends JpaRepository<FileRecord, Long> {

    List<FileRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FileRecord> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category);

    Optional<FileRecord> findByIdAndUserId(Long id, Long userId);
}
