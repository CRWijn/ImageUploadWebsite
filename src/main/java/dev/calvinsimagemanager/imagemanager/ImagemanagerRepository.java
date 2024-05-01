package dev.calvinsimagemanager.imagemanager;

import java.util.List;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ImagemanagerRepository extends MongoRepository<ImagemanagerModel, String> {

    List<ImagemanagerModel> findByAlbumName(String albumName);

    @Aggregation(pipeline = {
        "{ '$sort' : { 'dateAdded' : 1 } }", 
        "{ '$skip' : ?0 }", 
        "{ '$limit' : ?1 }"
      })
    List<ImagemanagerModel> getNImages(int skip, int limit);

}
