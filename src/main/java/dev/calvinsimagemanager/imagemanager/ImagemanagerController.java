package dev.calvinsimagemanager.imagemanager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
public class ImagemanagerController {
    
    @Autowired
    private ImagemanagerService imagemanagerService;

    @PostMapping("/image/post")
    public ResponseEntity<String> addImages(@RequestParam("images[]") MultipartFile[] imagesData, @RequestParam("albums") List<String> albums) {
        return new ResponseEntity<String>(imagemanagerService.postImage(imagesData, albums), HttpStatus.OK);
    }

    @GetMapping("/image/get-all")
    public ResponseEntity<List<ImagemanagerModel>> getAllImages() {
        return new ResponseEntity<List<ImagemanagerModel>>(imagemanagerService.getAllImages(), HttpStatus.OK);
    }

    @GetMapping("/image/get/{id}")
    public ResponseEntity<Optional<ImageBytesModel>> getImage(@PathVariable String id) {
        return new ResponseEntity<Optional<ImageBytesModel>>(imagemanagerService.getImage(id), HttpStatus.OK);
    }

    @GetMapping("/image/get-n-images/{start}/{number}")
    public ResponseEntity<List<ImageBytesModel>> getNImages(@PathVariable int start, @PathVariable int number) {
        return new ResponseEntity<List<ImageBytesModel>>(imagemanagerService.getNImages(start, number), HttpStatus.OK);
    }

    @GetMapping("/image/get-from-album/{albumName}")
    public ResponseEntity<List<ImagemanagerModel>> getImagesFromAlbum(@PathVariable String albumName) {
        return new ResponseEntity<List<ImagemanagerModel>>(imagemanagerService.getImagesFromAlbum(albumName), HttpStatus.OK);
    }

    @PatchMapping("/image/update/add-to-album/{id}/{albumName}")
    public ResponseEntity<String> addImageToAlbum(@PathVariable String id, @PathVariable String albumName) {
        return new ResponseEntity<String>(imagemanagerService.addImageToAlbum(id, albumName), HttpStatus.OK);
    }

    @PatchMapping("image/update/remove-from-album/{id}/{albumName}")
    public ResponseEntity<String> removeImageFromAlbum(@PathVariable String id, @PathVariable String albumName) {
        return new ResponseEntity<String>(imagemanagerService.removeImageFromAlbum(id, albumName), HttpStatus.OK);
    }

    @DeleteMapping("/image/delete/{id}")
    public ResponseEntity<String> deleteImage(@PathVariable String id) {
        return new ResponseEntity<String>(imagemanagerService.deleteImage(id), HttpStatus.OK);
    }

    @PostMapping("album/post")
    public ResponseEntity<String> addAlbum(@RequestBody AlbumModel albumModel) {
        return new ResponseEntity<String>(imagemanagerService.addAlbum(albumModel), HttpStatus.OK);
    }

    @GetMapping("album/get-all")
    public ResponseEntity<List<AlbumModel>> getAllAlbums() {
        return new ResponseEntity<List<AlbumModel>>(imagemanagerService.getAllAlbums(), HttpStatus.OK);
    }

    @DeleteMapping("album/delete/{albumName}")
    public ResponseEntity<String> deleteAlbum(@PathVariable String albumName) {
        return new ResponseEntity<>(imagemanagerService.deleteAlbum(albumName), HttpStatus.OK);
    }

}
