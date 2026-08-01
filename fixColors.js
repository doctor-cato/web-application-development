const fs = require('fs');
let html = fs.readFileSync('frontend/src/engagement/cinematch/index.html', 'utf8');

const newCSS = `
        /* Dynamic Colors for Genre */
        .pref-card[data-group="genre"][data-value="Hành Động"]:hover,
        .pref-card[data-group="genre"][data-value="Hành Động"].selected { border-color: #ff4500; box-shadow: 0 0 15px rgba(255, 69, 0, 0.3); background: rgba(255, 69, 0, 0.1); }
        .pref-card[data-group="genre"][data-value="Hành Động"]:hover i,
        .pref-card[data-group="genre"][data-value="Hành Động"].selected i { color: #ff4500; }

        .pref-card[data-group="genre"][data-value="Tình Cảm"]:hover,
        .pref-card[data-group="genre"][data-value="Tình Cảm"].selected { border-color: #ff69b4; box-shadow: 0 0 15px rgba(255, 105, 180, 0.3); background: rgba(255, 105, 180, 0.1); }
        .pref-card[data-group="genre"][data-value="Tình Cảm"]:hover i,
        .pref-card[data-group="genre"][data-value="Tình Cảm"].selected i { color: #ff69b4; }

        .pref-card[data-group="genre"][data-value="Kinh Dị"]:hover,
        .pref-card[data-group="genre"][data-value="Kinh Dị"].selected { border-color: #39ff14; box-shadow: 0 0 15px rgba(57, 255, 20, 0.3); background: rgba(57, 255, 20, 0.1); }
        .pref-card[data-group="genre"][data-value="Kinh Dị"]:hover i,
        .pref-card[data-group="genre"][data-value="Kinh Dị"].selected i { color: #39ff14; }

        .pref-card[data-group="genre"][data-value="Hài Kịch"]:hover,
        .pref-card[data-group="genre"][data-value="Hài Kịch"].selected,
        .pref-card[data-group="genre"][data-value="Hài"]:hover,
        .pref-card[data-group="genre"][data-value="Hài"].selected { border-color: #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); background: rgba(255, 215, 0, 0.1); }
        .pref-card[data-group="genre"][data-value="Hài Kịch"]:hover i,
        .pref-card[data-group="genre"][data-value="Hài Kịch"].selected i,
        .pref-card[data-group="genre"][data-value="Hài"]:hover i,
        .pref-card[data-group="genre"][data-value="Hài"].selected i { color: #ffd700; }

        .pref-card[data-group="genre"][data-value="Viễn Tưởng"]:hover,
        .pref-card[data-group="genre"][data-value="Viễn Tưởng"].selected { border-color: #1e90ff; box-shadow: 0 0 15px rgba(30, 144, 255, 0.3); background: rgba(30, 144, 255, 0.1); }
        .pref-card[data-group="genre"][data-value="Viễn Tưởng"]:hover i,
        .pref-card[data-group="genre"][data-value="Viễn Tưởng"].selected i { color: #1e90ff; }

        .pref-card[data-group="genre"][data-value="all"]:hover,
        .pref-card[data-group="genre"][data-value="all"].selected { border-color: #9d00ff; box-shadow: 0 0 15px rgba(157, 0, 255, 0.3); background: rgba(157, 0, 255, 0.1); }
        .pref-card[data-group="genre"][data-value="all"]:hover i,
        .pref-card[data-group="genre"][data-value="all"].selected i { color: #9d00ff; }

        /* Dynamic Colors for Time */
        .pref-card[data-group="time"][data-value="morning"]:hover,
        .pref-card[data-group="time"][data-value="morning"].selected { border-color: #ffb800; box-shadow: 0 0 15px rgba(255, 184, 0, 0.3); background: rgba(255, 184, 0, 0.1); }
        .pref-card[data-group="time"][data-value="morning"]:hover i,
        .pref-card[data-group="time"][data-value="morning"].selected i { color: #ffb800; }

        .pref-card[data-group="time"][data-value="afternoon"]:hover,
        .pref-card[data-group="time"][data-value="afternoon"].selected { border-color: #ff8c00; box-shadow: 0 0 15px rgba(255, 140, 0, 0.3); background: rgba(255, 140, 0, 0.1); }
        .pref-card[data-group="time"][data-value="afternoon"]:hover i,
        .pref-card[data-group="time"][data-value="afternoon"].selected i { color: #ff8c00; }

        .pref-card[data-group="time"][data-value="evening"]:hover,
        .pref-card[data-group="time"][data-value="evening"].selected { border-color: #8a2be2; box-shadow: 0 0 15px rgba(138, 43, 226, 0.3); background: rgba(138, 43, 226, 0.1); }
        .pref-card[data-group="time"][data-value="evening"]:hover i,
        .pref-card[data-group="time"][data-value="evening"].selected i { color: #8a2be2; }

        .pref-card[data-group="time"][data-value="any"]:hover,
        .pref-card[data-group="time"][data-value="any"].selected { border-color: #00f0ff; box-shadow: 0 0 15px rgba(0, 240, 255, 0.3); background: rgba(0, 240, 255, 0.1); }
        .pref-card[data-group="time"][data-value="any"]:hover i,
        .pref-card[data-group="time"][data-value="any"].selected i { color: #00f0ff; }

        /* Dynamic Colors for Cinema */
        .pref-card[data-group="cinema"][data-value="ha-dong"]:hover,
        .pref-card[data-group="cinema"][data-value="ha-dong"].selected { border-color: #00fa9a; box-shadow: 0 0 15px rgba(0, 250, 154, 0.3); background: rgba(0, 250, 154, 0.1); }
        .pref-card[data-group="cinema"][data-value="ha-dong"]:hover i,
        .pref-card[data-group="cinema"][data-value="ha-dong"].selected i { color: #00fa9a; }

        .pref-card[data-group="cinema"][data-value="le-trong-tan"]:hover,
        .pref-card[data-group="cinema"][data-value="le-trong-tan"].selected { border-color: #ff00ff; box-shadow: 0 0 15px rgba(255, 0, 255, 0.3); background: rgba(255, 0, 255, 0.1); }
        .pref-card[data-group="cinema"][data-value="le-trong-tan"]:hover i,
        .pref-card[data-group="cinema"][data-value="le-trong-tan"].selected i { color: #ff00ff; }

        .pref-card[data-group="cinema"][data-value="cau-giay"]:hover,
        .pref-card[data-group="cinema"][data-value="cau-giay"].selected { border-color: #00bfff; box-shadow: 0 0 15px rgba(0, 191, 255, 0.3); background: rgba(0, 191, 255, 0.1); }
        .pref-card[data-group="cinema"][data-value="cau-giay"]:hover i,
        .pref-card[data-group="cinema"][data-value="cau-giay"].selected i { color: #00bfff; }

        .pref-card[data-group="cinema"][data-value="any"]:hover,
        .pref-card[data-group="cinema"][data-value="any"].selected { border-color: #00f0ff; box-shadow: 0 0 15px rgba(0, 240, 255, 0.3); background: rgba(0, 240, 255, 0.1); }
        .pref-card[data-group="cinema"][data-value="any"]:hover i,
        .pref-card[data-group="cinema"][data-value="any"].selected i { color: #00f0ff; }

        /* Dynamic Colors for Gender */
        .pref-card[data-group="gender"][data-value="opposite"]:hover,
        .pref-card[data-group="gender"][data-value="opposite"].selected { border-color: #ff1493; box-shadow: 0 0 15px rgba(255, 20, 147, 0.3); background: rgba(255, 20, 147, 0.1); }
        .pref-card[data-group="gender"][data-value="opposite"]:hover i,
        .pref-card[data-group="gender"][data-value="opposite"].selected i { color: #ff1493; }

        .pref-card[data-group="gender"][data-value="same"]:hover,
        .pref-card[data-group="gender"][data-value="same"].selected { border-color: #1e90ff; box-shadow: 0 0 15px rgba(30, 144, 255, 0.3); background: rgba(30, 144, 255, 0.1); }
        .pref-card[data-group="gender"][data-value="same"]:hover i,
        .pref-card[data-group="gender"][data-value="same"].selected i { color: #1e90ff; }

        .pref-card[data-group="gender"][data-value="any"]:hover,
        .pref-card[data-group="gender"][data-value="any"].selected { border-color: #9d00ff; box-shadow: 0 0 15px rgba(157, 0, 255, 0.3); background: rgba(157, 0, 255, 0.1); }
        .pref-card[data-group="gender"][data-value="any"]:hover i,
        .pref-card[data-group="gender"][data-value="any"].selected i { color: #9d00ff; }
`;

// Remove the old general gender rule that I added earlier or that existed
html = html.replace(/\.pref-card\[data-group="gender"\]:hover,\s*\.pref-card\[data-group="gender"\].selected \{[^\}]+\}\s*\.pref-card\[data-group="gender"\]:hover i,\s*\.pref-card\[data-group="gender"\].selected i \{[^\}]+\}/g, '');

// Append the new CSS right before </style>
html = html.replace('</style>', newCSS + '\n</style>');

fs.writeFileSync('frontend/src/engagement/cinematch/index.html', html);
console.log('done');
