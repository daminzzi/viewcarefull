package com.ssafy.ViewCareFull.domain.gallery.service;

import com.ssafy.ViewCareFull.domain.gallery.dto.GalleryResponseDto;
import com.ssafy.ViewCareFull.domain.gallery.entity.Image;
import com.ssafy.ViewCareFull.domain.gallery.exception.FileSaveFailException;
import com.ssafy.ViewCareFull.domain.gallery.exception.NoMatchCaregiverException;
import com.ssafy.ViewCareFull.domain.gallery.repository.ImageRepository;
import com.ssafy.ViewCareFull.domain.users.dto.CaregiverIdDto;
import com.ssafy.ViewCareFull.domain.users.entity.user.Users;
import com.ssafy.ViewCareFull.domain.users.security.SecurityUsers;
import com.ssafy.ViewCareFull.domain.users.service.UserLinkService;
import java.io.File;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class GalleryService {

  @Value("${file.path}")
  private String fileRealPath;
  private final ImageRepository imageRepository;
  private final UserLinkService userLinkService;
  @Value("${file.server.url}")
  private String fileServerUrl;

  @Transactional
  public void saveImage(SecurityUsers securityUsers, MultipartFile image) {
    Users user = securityUsers.getUser();
    CaregiverIdDto caregiverIdDto = userLinkService.getCareGiverIdFromOtherUser(user.getId())
        .orElseThrow(NoMatchCaregiverException::new);
    String ext = getImageExtension(image);
    String fileName = UUID.randomUUID().toString() + ext;
    String saveLocation = fileRealPath + fileName;
    imageRepository.save(new Image(saveLocation, fileName, caregiverIdDto));
    saveImageToDisk(image, saveLocation);
  }

  private void saveImageToDisk(MultipartFile image, String saveLocation) {
    try {
      image.transferTo(new File(saveLocation));
    } catch (IOException e) {
      log.error("saveImage: {}", e.getMessage());
      throw new FileSaveFailException();
    }
  }

  private String getImageExtension(MultipartFile image) {
    String ext = ".jpg";
    if (image.getOriginalFilename().lastIndexOf(".") != -1) {
      ext = image.getOriginalFilename().substring(image.getOriginalFilename().lastIndexOf("."));
    }
    return ext;
  }

  public GalleryResponseDto getGallery(SecurityUsers securityUsers, Pageable pageable) {
    Users user = securityUsers.getUser();
    CaregiverIdDto caregiverIdDto = userLinkService.getCareGiverIdFromOtherUser(user.getId())
        .orElseThrow(NoMatchCaregiverException::new);
    Page<Image> page = imageRepository.findAllByCaregiverId(caregiverIdDto.getCaregiverId(), pageable);
    return new GalleryResponseDto(page, fileServerUrl);
  }
}