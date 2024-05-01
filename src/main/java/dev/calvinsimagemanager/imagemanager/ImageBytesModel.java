package dev.calvinsimagemanager.imagemanager;

import java.util.Optional;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImageBytesModel {
    
    private byte[] imageBytes;
    private String imageSuffix;
    private String imageId;

    static Optional<String> getExtension(String fileName) {
        int pointNdx = -1;
        for (int i = fileName.length() - 1; i > -1; i--) {
            if (fileName.charAt(i) == '.') {
                pointNdx = i;
                break;
            }
        }

        if (pointNdx == -1) {
            return Optional.empty();
        }

        return Optional.of(fileName.substring(pointNdx));
    }

}
