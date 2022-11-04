var UI = {};

UI.message = function(text, duration) {
    mp.osd_message(text, duration || 3);
};

UI.successMessage = function(text) {
    this.message(text, 5);
};

UI.errorMessage = function(text) {
    this.message(text, 5);
};

module.exports = UI;