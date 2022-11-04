/**
 * A simple trim script that re-encodes in h264 and mixes the audio down to 2 channels.
 * Uses the currently selected tracks and tries to burn in subtitles.
 * 
 * Set start and end positions with {Consts.KEY_SET_START} and {Consts.KEY_SET_END}.
 * Double press either after selection to save the trim. Jump to either position 
 * with {Consts.KEY_JUMP_TO_START} or {Consts.KEY_JUMP_TO_END}.
 * 
 * Inspired by aerobounce's and Qwerty-Space's scripts:
 * - https://github.com/aerobounce/trim.lua
 * - https://github.com/Qwerty-Space/dotfiles/blob/master/home/mpv/.config/mpv/scripts/clip.js
 */

var Consts = require('./trim/consts');
var Trim = require('./trim/trim');
var UI = require('./trim/ui');
var Utils = require('./trim/utils');

var startPosition = 0.0;
var endPosition = 0.0;

var inTrimMode = false;
var defaultKeepOpen;

function init() {
    loadDefaults();
}

function loadDefaults() {
    defaultKeepOpen = mp.get_property('options/keep-open');
}

function onEndOfFileReached() {
    mp.set_property('pause', 'yes');
    mp.commandv('seek', 100, 'absolute-percent', 'exact');
}

function toggleTrimMode(enabled) {
    if (inTrimMode === enabled) return;
    inTrimMode = enabled;

    if (Utils.isVideoFile()) {
        mp.set_property('hr-seek', enabled ? 'no' : 'default');
    }

    mp.commandv('script-message', 'osc-visibility', enabled ? 'always' : 'auto');
    mp.set_property('pause', 'yes');
    mp.set_property('options/keep-open', enabled ? 'always' : defaultKeepOpen);

    if (enabled) {
        mp.register_event('eof-reached', onEndOfFileReached);
    } else {
        mp.unregister_event('eof-reacher', onEndOfFileReached);
    }
}

function save() {
    UI.message('Saving trim...');

    var result = Trim.encode(
        startPosition,
        endPosition,
        Utils.getCurrentVideoTrack(),
        Utils.getCurrentAudioTrack(),
        Utils.getCurrentSubTrack()
    );

    toggleTrimMode(false);

    if (result == true) {
        UI.successMessage('Done!');
    } else {
        UI.errorMessage('Error: ' + result);
    }
    
}

function onSetTrimStartPress() {
    toggleTrimMode(true);

    // Make sure current time-pos is a keyframes.
    if (Utils.isVideoFile()) {
        mp.commandv('seek', -0.01, 'keyframes', 'exact');
        mp.commandv('seek', 0.01, 'keyframes', 'exact');
    }

    var newPosition = mp.get_property_number('time-pos');

    // Save when user presses same key a second time.
    if (startPosition === newPosition) {
        save();
        return;
    }

    startPosition = newPosition;

    UI.message('Trim start set');
}

function onSetTrimEndPress() {
    toggleTrimMode(true);

    // Make sure current time-pos is a keyframes.
    if (Utils.isVideoFile()) {
        mp.commandv('seek', -0.01, 'keyframes', 'exact');
        mp.commandv('seek', 0.01, 'keyframes', 'exact');
    }

    var newPosition = mp.get_property_number('time-pos');

    // Save when user presses same key a second time.
    if (endPosition === newPosition) {
        save();
        return;
    }

    endPosition = newPosition;

    UI.message('Trim end set');
}

function onJumpToTrimStartPress() {
    mp.commandv('seek', startPosition, 'absolute');
    mp.command('show-progress');
    UI.message('Jump to trim start');
}

function onJumpToTrimEndPress() {
    mp.commandv('seek', endPosition, 'absolute');
    mp.command('show-progress');
    UI.message('Jump to trim end');
}

mp.add_key_binding(Consts.KEY_SET_START, 'trim-set-start', onSetTrimStartPress);
mp.add_key_binding(Consts.KEY_SET_END, 'trim-set-end', onSetTrimEndPress);
mp.add_key_binding(Consts.KEY_JUMP_TO_START, 'trim-seek-to-start', onJumpToTrimStartPress);
mp.add_key_binding(Consts.KEY_JUMP_TO_END, 'trim-seek-to-end', onJumpToTrimEndPress);

mp.register_event('file-loaded', init);