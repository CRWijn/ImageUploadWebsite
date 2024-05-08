package dev.calvinsimagemanager.imagemanager;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

public class LocalImageManager {

    //From: https://medium.com/@kkarththi15/saving-images-locally-in-a-spring-boot-web-application-01405a988bc7
    static String saveImage(String imageDirectory, MultipartFile imageFile) throws IOException {
        String uniqueFileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();

        Path imgLocPath = Path.of(imageDirectory);
        Path imgPath = imgLocPath.resolve(uniqueFileName);

        Files.copy(imageFile.getInputStream(), imgPath, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFileName;
    }

    //From: https://medium.com/@kkarththi15/saving-images-locally-in-a-spring-boot-web-application-01405a988bc7
    static Optional<byte[]> getImage(String imageDirectory, String imageName) throws IOException {
        Path imagePath = Path.of(imageDirectory, imageName);

        if (Files.exists(imagePath)) {
            byte[] imageBytes = Files.readAllBytes(imagePath);
            return Optional.of(imageBytes);
        } else {
            return Optional.empty();
        }
    }

    //From: https://medium.com/@kkarththi15/saving-images-locally-in-a-spring-boot-web-application-01405a988bc7
    static String deleteImage(String imageDirectory, String imageName) throws IOException {
        Path imagePath = Path.of(imageDirectory, imageName);

        if (Files.exists(imagePath)) {
            Files.delete(imagePath);
            return "Success";
        } else {
            return "Failed"; // Handle missing images
        }
    }
}
