package dev.calvinsimagemanager.imagemanager;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Document(collection = "Images")
public class ImagemanagerModel {
    
    @Id
    String uniqueId;
    String imageName;
    String imageDirectory;
    LocalDateTime dateAdded;
    List<String> albumName;

    public void addToAlbum(String name) {
        if (!albumName.contains(name)) {
            albumName.add(name);
        }
    }

    public String removeFromAlbum(String name) {
        if (!albumName.contains(name)) {
            return "null";
        }
        albumName.remove(albumName.indexOf(name));
        return "Removed " + name + " successfully";
    }

}
