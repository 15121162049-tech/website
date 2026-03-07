// 音频模块
const AudioManager = {
    audioContext: null,
    bgMusic: null,
    
    init: function() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.createBackgroundMusic();
    },
    
    createBackgroundMusic: function() {
        const playNote = (frequency, startTime, duration, type = 'sine') => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, startTime);

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        this.bgMusic = {
            play: function() {
                if (!GameState.soundEnabled || !AudioManager.audioContext) return;
                if (AudioManager.audioContext.state === 'suspended') {
                    AudioManager.audioContext.resume();
                }
                this.isPlaying = true;
                this.scheduleNext();
            },
            stop: function() {
                this.isPlaying = false;
            },
            isPlaying: false,
            nextNoteTime: 0,
            scheduleNext: function() {
                if (!this.isPlaying) return;

                const tempo = 120;
                const secondsPerBeat = 60.0 / tempo;
                const noteLength = 0.3;

                while (this.nextNoteTime < AudioManager.audioContext.currentTime + 0.5) {
                    const beat = Math.floor(this.nextNoteTime / secondsPerBeat) % 16;

                    // 简单的电子音乐模式
                    if (beat % 4 === 0) {
                        playNote(110, this.nextNoteTime, noteLength, 'triangle'); // 低音
                    }
                    if (beat % 4 === 2) {
                        playNote(165, this.nextNoteTime, noteLength * 0.5, 'sine');
                    }
                    if (beat % 8 === 7) {
                        playNote(220, this.nextNoteTime, noteLength, 'triangle');
                    }

                    // 随机高音旋律
                    if (beat % 2 === 0 && Math.random() > 0.5) {
                        const notes = [330, 440, 550, 660];
                        playNote(notes[Math.floor(Math.random() * notes.length)], this.nextNoteTime, noteLength * 0.3, 'sine');
                    }

                    this.nextNoteTime += secondsPerBeat / 2;
                }

                if (this.isPlaying) {
                    setTimeout(() => this.scheduleNext(), 100);
                }
            }
        };
    },
    
    playScoreSound: function() {
        if (!this.audioContext || !GameState.soundEnabled) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    },
    
    playHitSound: function() {
        if (!this.audioContext || !GameState.soundEnabled) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
};