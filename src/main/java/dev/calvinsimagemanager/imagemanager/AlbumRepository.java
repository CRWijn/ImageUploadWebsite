package dev.calvinsimagemanager.imagemanager;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AlbumRepository extends MongoRepository<AlbumModel, String> {} 
