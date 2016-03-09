'use strict';

module.exports = {
    snake: function(text) {
        return (text || '').split('').map(function(ch, i) {
            return i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
        }).join('');
    }
};