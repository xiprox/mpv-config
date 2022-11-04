var Utils = require('./utils');

var Trim = {};

/**
 * Checks if positions are valid. Returns an error message if there is
 * a problem, or null otherwise.
 */
function validatePositions(start, end) {
    if (!start || start === 'none' || !end || end === 'none') {
        return 'Start or end position is unassigned.';
    }

    if (start === end) {
        return 'Start and end positions can\'t be the same.'
    }

    if (start > end) {
        return 'Start position can\'t be after end position.';
    }

    return null;
}

/**
 * Trims and encodes the selected portion of the video.
 * 
 * @param {*} start the start position. 
 * @param {*} end the end position.
 * @param {*} videoTrack the video track to use.
 * @param {*} audioTrack the audio track to use.
 * @param {*} subTrack the subtitle track to use.
 * 
 * @returns true on success, or a string if there was an error. 
 */
Trim.encode = function(start, end, videoTrack, audioTrack, subTrack) { 
    var error = validatePositions(start, end);
    if (error) return error;

    var destination = Utils.generateNewTrimPath();

    if (!destination || destination === '') {
        return 'Failed to generate destination path.';
    }

    var duration = endPosition - startPosition;
    var sourcePath = mp.get_property_native('path');

    var videoTrackId = videoTrack ? (videoTrack.id - 1) : '?';
    var audioTrackId = audioTrack ? (audioTrack.id - 1) : '?';

    var command = [
        'ffmpeg',

        '-hide_banner',
        '-loglevel', 'verbose',

        '-y',

        '-copyts',

        '-i', sourcePath,

        '-ss', String(start),
        '-t', String(duration),

        '-map', '0:v:' + videoTrackId,
        '-map', '0:a:' + audioTrackId,

        '-codec:v', 'libx264',
        '-crf', '24',
        '-preset', 'veryfast',

        '-ac', '2',
        '-codec:a', 'libopus',
        '-b:a', '320k',

        '-strict', '-2',

        '-avoid_negative_ts', 'make_zero',
        '-async', '1',
    ];

    if (videoTrack && subTrack) {
        command.push('-ss');
        command.push(String(start));
        command.push('-vf');
        command.push('subtitles=' + Utils.escapePath(sourcePath) + ':si=' + (subTrack.id - 1));
    }

    command.push(destination);

    mp.msg.log('info', 'Executing ffmpeg command:');
    mp.msg.log('info', command.join(' '));

    var result = mp.command_native({
        name: 'subprocess',
        args: command,
        capture_stdout: true
    });

    if (result.status == 1) {
        return 'Encoding failed. Check console (try `).';
    } else {
        mp.msg.log('info', 'Trim saved: ' + destinationPath);
        return true;
    }
};

module.exports = Trim;
