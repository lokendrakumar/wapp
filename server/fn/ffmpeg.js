var Promise = require('bluebird');
var _ = require('lodash');
var util = require('util');
var exec = require('child_process').exec;
var fs = require('fs');
var config = require('config');

var ffmpeg = module.exports = {
  /**
   * Merge audio & video file, Convert .webm to .mp4, Crop video file in 16:9 aspect ratio
   * @param response
   * @param files
   * @param callback
   */

  merge: function (response, files) {
    // its probably *nix, assume ffmpeg is available
    return new Promise(function (resolve, reject) {
      var audioFile = files.audio.path;
      var videoFile = files.video.path;    

      var mergedFile = config.app.uploadsDir + '/' + files.audio.name.split('.')[0] + '-merged.webm';

      // command to merge video & audio
      var command = "ffmpeg -i " + audioFile + " -i " + videoFile + " -map 0:0 -map 1:0 " + mergedFile;
      
      exec(command, function (error, stdout, stderr) {
        if (error) {
          reject(error);
        } else {
          resolve(mergedFile);
        }
        // removing audio/video files
        fs.unlink(audioFile);
        fs.unlink(videoFile);
      });
    });
  },

  /**
   * convert webm videos to mp4
   * @param response
   * @param file
   * @param callback
   */
  convertToMp4: function (file) {
    return new Promise(function (resolve, reject) {
      var videoFilePath = file;  
      var videoMp4File = videoFilePath.split('-')[0] + '-converted.mp4';   

      // command to convert video in mp4 format
      var commandConvertToMp4 = "ffmpeg -fflags +genpts -i " + videoFilePath + " -r 24 -strict -2 " + videoMp4File;

      exec(commandConvertToMp4, function (error, stdout, stderr) {
        if (error) {
          reject (error);
        } else {
          resolve (videoMp4File);
        }
        // removing video file
        fs.unlink(videoFilePath);
      });

    });   
  },

  /**
   *  crop video in 9:16
   * @param response
   * @param file
   * @param callback
   */
  cropToFit: function (file) {

    return new Promise(function (resolve, reject) {
      var videoFilePath = file;
      var videoMp4FileCropped = videoFilePath.split('-')[0] + '-cropped.mp4'

      // command to crop the video to fit 9:16
      var commandCropToFit = 'ffmpeg -i ' + videoFilePath + ' -filter:v "crop=in_h*(9/16):in_h:(in_w-(in_h*(9/16)))/2:0" -c:a copy ' + videoMp4FileCropped;

      exec(commandCropToFit, function (error, stdout, stderr) {
        if (error) {
          reject (error);
        } else {
          resolve (videoMp4FileCropped);
        }
        // removing video file
        fs.unlink(videoFilePath);
     });
   });    
  },

  /**
   *
   * @param response
   * @param file
   * @param callback
   */
  cropToFitVerticalVideo: function (file) {

   return new Promise(function (resolve, reject) {
    var videoFilePath = file;
    var videoMp4FileCropped = videoFilePath.split('-')[0] + '-cropped.mp4'

    var commandCropToFit = 'ffmpeg -i ' + videoMp4File + ' -vf "crop=in_w:in_w*9/16:0:(in_w-(in_h*(9/16)))/2" -strict -2 ' + videoMp4FileCropped;

    exec(commandCropToFit, function (error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        resolve(videoMp4FileCropped);
      }
      // removing video file
      fs.unlink(videoFilePath);
      });
    });    
  },

  /**
   * Cropping the video along width (width - height)/2
   * @param response
   * @param file
   * @param callback
   */
  cropToFitSameAspectRatioWidth: function (file) {

    return new Promise(function (resolve, reject) {
      var videoFilePath = file;
      var videoMp4FileCropped = videoFilePath.split('-')[0] + '-cropped.mp4'

      var commandCropToFit = 'ffmpeg -i ' + videoFilePath + ' -vf "crop=in_h:in_h:(in_w-in_h)/2:0" -strict -2 ' + videoMp4FileCropped;

      exec(commandCropToFit, function (error, stdout, stderr) {
        if (error) {
          reject(error);
        } else {
          resolve(videoMp4FileCropped);
        }
        // removing video file
        //fs.unlink(videoFilePath);
      });
    });
  },

  /**
   * cropping the video along height (height - width)/2
   * @param response
   * @param file
   * @param callback
   */
  cropToFitSameAspectRatioHeight: function (file) {

    return new Promise(function (resolve, reject) {
      var videoFilePath = file;
      var videoMp4FileCropped = videoFilePath.split('-')[0] + '-cropped.mp4'

      var commandCropToFit = 'ffmpeg -i ' + videoMp4File + ' -vf "crop=in_w:in_w:(in_h-in_w)/2:0" -strict -2 ' + videoMp4FileCropped;

      exec(commandCropToFit, function (error, stdout, stderr) {
        if (error) {
          reject(error);
        } else {
          resolve(videoMp4FileCropped);
        }
        // removing video file
        //fs.unlink (videoFilePath);
      });
    });    
  },

  /**
   * merge, convert and crop either square or 9:16
   * @param files
   * @param isSquare
   * @param callback
   */
  mergeAll: function (files, isSquare, callback) {
    // its probably *nix, assume ffmpeg is available
    console.log(files);
    var fileName = files.audio.name.split('.')[0] + '-' + Date.now();
    var audioFile = files.audio.path;
    var videoFile = files.video.path;
    var mergedFile = config.app.uploadsDir+'/'+fileName+'-merged.webm';
    var convertedFile = config.app.uploadsDir+'/'+fileName+'-converted.mp4';
    var croppedFile = config.app.uploadsDir+'/'+fileName+'-cropped.mp4';

    // command to merge video & audio
    var command = "ffmpeg -i " + audioFile + " -i " + videoFile + " -map 0:0 -map 1:0 " + mergedFile;
    exec(command, function (error, stdout, stderr) {     
      // if (stdout) console.log(stdout);
      // if (stderr) console.log(stderr);

      if (error) {
        // console.log('exec error: ' + error);
        callback(error, null);
      } else {

        // command to convert webm into mp4
        var commandMP4 =  "ffmpeg -fflags +genpts -i " + mergedFile + " -r 24 -strict -2 " + convertedFile;

        exec(commandMP4, function(error, stdout, stderr){
          // if (stdout) console.log(stdout);
          // if (stderr) console.log(stderr);
          if (error) {
            // console.log('exec error: ' + error);
            callback(error, null);
          } else {
            var commandConvert = '';
            if (isSquare) {
              commandConvert = 'ffmpeg -i ' + convertedFile + ' -vf "crop=in_h:in_h:(in_w-in_h)/2:0" -strict -2 ' + croppedFile;
            } else {
              //command to crop the video in the aspect of ratio 9:16
              commandConvert =  'ffmpeg -i ' + convertedFile + ' -filter:v "crop=in_h*(9/16):in_h:(in_w-(in_h*(9/16)))/2:0" -c:a copy ' + croppedFile;
            }
            exec(commandConvert, function(error, stdout, stderr){
              // if (stdout) console.log(stdout);
              // if (stderr) console.log(stderr);
              if (error) {
                // console.log('exec error: ' + error);
                callback(error, null);
              } else {
                callback(null, croppedFile);
              }
            });   

            // removing audio/video files
            fs.unlink(audioFile);
            fs.unlink(videoFile);    
            // fs.unlink(mergedFile);   
            // fs.unlink(convertedFile);  
          }
        });
      }
    });
  }
};