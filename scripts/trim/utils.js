var Utils = {};

Utils.getCurrentVideoTrack = function() {
    return mp.get_property_native('current-tracks/video');
}

Utils.getCurrentAudioTrack = function() {
    return mp.get_property_native('current-tracks/audio');
}

Utils.getCurrentSubTrack = function() {
    return mp.get_property_native('current-tracks/sub');
}

Utils.isVideoFile = function() {
    var track = this.getCurrentVideoTrack();
    return track && track.album_art === false;
}

/**
 * Generates a new path (including filename and extension) for a new trim.
 */
Utils.generateNewTrimPath = function() {
    var path = mp.get_property('path') || '';
    var filename = mp.get_property('filename/no-ext') || 'trim';
    var extension = 'mp4';
    var destinationDirectory = mp.utils.split_path(path)[0];
    var destinationFiles =  mp.utils.readdir(destinationDirectory);

    if (!destinationFiles) return null;

    var files = {};
    destinationFiles.forEach(function (file) {
        files[file] = true;
    });

    var output = filename + ' $n.' + extension;

    var i = 1;
    while (true) {
        var potentialName = output.replace('$n', i);
        if (!files[potentialName]) {
            return destinationDirectory + potentialName;
        }
        i++;
    }
}

/**
 * Replaces ':' with '\\:' and '\' with '\\\\'.
 */
Utils.escapePath = function(string) { 
    return string.replace(/([\\'=:])/g, '\\$1').replace(/([\\'\[\],;])/g, '\\$1')
}

module.exports = Utils;