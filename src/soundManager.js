export class SoundManager {
    plopp() {
        if (!plopp.playing()) {
            plopp.play();
        }
    }

    puh() {
        puh.play();
    }

    zzup() {
        zzup.play();
    }
}

const plopp = new Howl({
    src: ['graphics/plopp.mp3'],
    volume: 0.2,
});

const puh = new Howl({
    src: ['graphics/puh.mp3'],
    volume: 0.2,
});

const zzup = new Howl({
    src: ['graphics/zzup.mp3'],
    volume: 0.1,
});

// Create an audio sprite with the melody
const melody = new Howl({
    src: ['graphics/background.mp3'],
    sprite: {
        loop: [0, 5000],
    },
    loop: true, // Enable loop
    volume: 0.05, // Adjust volume as needed
});

// Start playing the melody
melody.play('loop');