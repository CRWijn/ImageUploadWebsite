package dev.calvinsimagemanager.imagemanager;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImagemanagerService {

    @Autowired
    private ImagemanagerRepository imgManagerRepository;

    @Autowired
    private AlbumRepository albumRepo;

    public String postImage(MultipartFile[] imagesData, List<String> albums) {
        String imageDirectory = "D:/ServerImageDatabase";
        String newId;
        List<String> addedImageIds = new ArrayList<String>();
        for (MultipartFile singleImageData : imagesData) {
            try {
                newId = LocalImageManager.saveImage(imageDirectory, singleImageData);
            } catch (IOException e) {
                return "Ran into an IOException: " + e;
            }
            ImagemanagerModel newModel = new ImagemanagerModel();
            newModel.setUniqueId(newId);
            addedImageIds.add(newId);
            newModel.setAlbumName(new ArrayList<String>());
            newModel.setImageDirectory(imageDirectory);
            newModel.setImageName(newId);
            newModel.setDateAdded(LocalDateTime.now());
            imgManagerRepository.save(newModel);
        }
        addImageToAlbum(addedImageIds, albums);
        return "Image saved successfully!";
    }
    
    public List<ImagemanagerModel> getAllImages() {
        return imgManagerRepository.findAll();
    }

    public Optional<ImageBytesModel> getImage(String id) {
        Optional<ImagemanagerModel> imgModelOption = imgManagerRepository.findById(id);
        if (!imgModelOption.isPresent()) {
            return Optional.empty();
        }
        ImagemanagerModel imgModel = imgModelOption.get();
        try {
            Optional<byte[]> imageBytes = LocalImageManager.getImage(imgModel.getImageDirectory(), imgModel.getImageName());
            if (!imageBytes.isPresent()) {
                return Optional.empty();
            }
            ImageBytesModel newBytesData = new ImageBytesModel();
            newBytesData.setImageBytes(imageBytes.get());
            Optional<String> fileSuffix = ImageBytesModel.getExtension(imgModel.getImageName());
            if (!fileSuffix.isPresent()) {
                return Optional.empty();
            }
            newBytesData.setImageSuffix(fileSuffix.get());
            newBytesData.setImageId(imgModel.getUniqueId());
            return Optional.of(newBytesData);
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    public List<ImageBytesModel> getNImages(int skip, int limit) {
        List<ImagemanagerModel> imageModels = imgManagerRepository.getNImages(skip, limit);
        List<ImageBytesModel> images = new ArrayList<ImageBytesModel>();
        for (ImagemanagerModel imageModel : imageModels) {
            Optional<ImageBytesModel> imageDataOption = getImage(imageModel.getUniqueId());
            if (imageDataOption.isPresent()) {
                images.add(imageDataOption.get());
            }
        }
        return images;
    }

    public List<ImageBytesModel> getNImagesFromAlbum(String albumName, int skip, int limit) {
        List<ImagemanagerModel> imageModels = imgManagerRepository.getNImagesSortAlbum(albumName, skip, limit);
        List<ImageBytesModel> images = new ArrayList<ImageBytesModel>();
        for (ImagemanagerModel imageModel : imageModels) {
            Optional<ImageBytesModel> imageDataOption = getImage(imageModel.getUniqueId());
            if (imageDataOption.isPresent()) {
                images.add(imageDataOption.get());
            }
        }
        return images;
    }

    public String deleteImage(String id) {
        Optional<ImagemanagerModel> imgModelOption = imgManagerRepository.findById(id);
        if (!imgModelOption.isPresent()) {
            return "Image not found in database";
        }
        ImagemanagerModel imgModel = imgModelOption.get();

        try {
            String response = LocalImageManager.deleteImage(imgModel.getImageDirectory(), imgModel.getImageName());
            if (response == "Failed") {
                return "Could not find the images in the storage files";
            }
        } catch (IOException e) {
            return "Ran into an IOException: " + e; 
        }
        imgManagerRepository.deleteById(id);
        return "Image deleted successfully";
    }

    public String addAlbum(String newAlbumName) {
        if (newAlbumName.equals("none")) {
            return "Cannot name album none (reserved)";
        }
        AlbumModel newAlbum = new AlbumModel();
        newAlbum.setAlbumName(newAlbumName);
        if (albumRepo.existsById(newAlbum.getAlbumName())) {
            return "Album with that name already exists!";
        } else {
            albumRepo.save(newAlbum);
            return "Album added successfully";
        } 
    }

    public String deleteAlbum(String name) {
        albumRepo.deleteById(name);
        return "Album deleted successfully";
    }

    public List<AlbumModel> getAllAlbums()
    {
        return albumRepo.findAll();
    }

    public String addImageToAlbum(List<String> imageIds, List<String> albumNames) {
        for (String imageId: imageIds) {
            Optional<ImagemanagerModel> imageOption = imgManagerRepository.findById(imageId);
            if (!imageOption.isPresent()) {
                continue;
            }
            ImagemanagerModel image = imageOption.get();
            for (String albumName: albumNames) {
                Optional<AlbumModel> albumOption = albumRepo.findById(albumName);
                if (!albumOption.isPresent()) {
                    continue;
                }
                image.addToAlbum(albumName);
            }
            imgManagerRepository.save(image);
        }
        return "Finished adding image(s) to album(s)";
    }

    public String removeImageFromAlbum(String imageId, String albumName) {
        Optional<ImagemanagerModel> imageOption = imgManagerRepository.findById(imageId);
        if (!imageOption.isPresent()) {
            return "Image cannot be found";
        }
        ImagemanagerModel image = imageOption.get();
        String response = image.removeFromAlbum(albumName);
        if (response == "null") {
            return "Image is not part of album " + albumName;
        }
        imgManagerRepository.save(image);
        return "Image removed from ablum " + albumName;
    }

    public List<ImagemanagerModel> getImagesFromAlbum(String name) {
        return imgManagerRepository.findByAlbumName(name);
    }

    public String checkPassword(String password) {
        try {
            BufferedReader br = new BufferedReader(new FileReader("src/main/java/password.txt"));
            try {
                String actualPassword = br.readLine();
                if (!password.equals(actualPassword)) {
                    return "Incorrect Password";
                } else {
                    return "Correct Password";
                }
            } catch(IOException e) {
                return "IOException when reading password file: " + e;
            } finally {
                try {
                    br.close();
                } catch (IOException e) {
                    return "Could not close buffered reader: " + e;
                }
            }
        } catch (FileNotFoundException e) {
            return "File not found: " + e;
        }
    }
}
