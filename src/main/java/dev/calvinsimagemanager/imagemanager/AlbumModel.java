package dev.calvinsimagemanager.imagemanager;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Document(collection = "Albums")
public class AlbumModel {
    
    @Id
    String albumName;

}
