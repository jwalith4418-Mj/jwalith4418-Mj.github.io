(() => {
  'use strict';
  const toggle = document.getElementById('sound-toggle');
  const label = document.getElementById('sound-label');
  const volume = document.getElementById('sound-volume');
  const output = document.getElementById('volume-label');
  let audio = null, master = null, noise = null, enabled = false, pending = false;
  let lastEntrance = '', lastEntranceTime = -10;
  const voices = new Set();
  const blocked = () => document.hidden || ['modal-open', 'motion-paused', 'reading-mode'].some(c => document.body.classList.contains(c));
  const level = () => Number(volume.value) / 100 * .48;
  function stop() {
    for (const voice of voices) { try { voice.stop(); } catch {} }
    voices.clear();
  }
  function sync() {
    if (!audio) return;
    if (!enabled || blocked()) {
      stop(); master.gain.cancelScheduledValues(audio.currentTime); master.gain.setValueAtTime(0, audio.currentTime);
      audio.suspend().catch(() => {});
    } else {
      audio.resume().then(() => {
        if (!enabled || blocked()) return;
        master.gain.setTargetAtTime(level(), audio.currentTime, .035);
      }).catch(() => { label.textContent = 'Sound unavailable'; });
    }
  }
  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw Error('Audio unavailable');
    audio = new AC(); master = audio.createGain(); master.gain.value = 0;
    const limiter = audio.createDynamicsCompressor();
    limiter.threshold.value = -18; limiter.knee.value = 16; limiter.ratio.value = 5;
    limiter.attack.value = .004; limiter.release.value = .2;
    master.connect(limiter); limiter.connect(audio.destination);
    noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * .6;
  }
  function voice(source, filter, duration, gain, attack, delay = 0) {
    if (voices.size >= 24) return;
    const envelope = audio.createGain(), start = audio.currentTime + delay;
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.0001, gain), start + attack);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter || envelope); if (filter) filter.connect(envelope); envelope.connect(master);
    voices.add(source);
    source.onended = () => { voices.delete(source); source.disconnect(); filter?.disconnect(); envelope.disconnect(); };
    source.start(start); source.stop(start + duration + .025);
  }
  function tone(type, from, to, duration, gain, attack = .012, delay = 0) {
    const source = audio.createOscillator(), start = audio.currentTime + delay;
    source.type = type; source.frequency.setValueAtTime(from, start);
    source.frequency.exponentialRampToValueAtTime(to, start + duration);
    voice(source, null, duration, gain, attack, delay);
  }
  function hiss(type, frequency, to, duration, gain, attack = .012, delay = 0) {
    const source = audio.createBufferSource(), filter = audio.createBiquadFilter(), start = audio.currentTime + delay;
    source.buffer = noise; filter.type = type; filter.Q.value = .7;
    filter.frequency.setValueAtTime(frequency, start); filter.frequency.exponentialRampToValueAtTime(to, start + duration);
    voice(source, filter, duration, gain, attack, delay);
  }
  function play(id, entrance = false) {
    if (!enabled || !audio || audio.state !== 'running' || blocked() || Number(volume.value) === 0) return;
    if (entrance) {
      if (lastEntrance === id && audio.currentTime - lastEntranceTime < .7) return;
      lastEntrance = id; lastEntranceTime = audio.currentTime;
    }
    const strength = entrance ? .24 : 1;
    switch (id) {
      case 'ironman':
        tone('sine', 150, 1150, .42, .23 * strength, .13);
        tone('triangle', 1600, 90, .3, .15 * strength, .012, .25);
        hiss('highpass', 900, 3000, .45, .2 * strength, .09); break;
      case 'spiderman':
        hiss('bandpass', 1200, 6500, .2, .55 * strength);
        tone('triangle', 380, 65, .24, .2 * strength); break;
      case 'strange':
        [220, 277.18, 329.63, 440].forEach((f, i) => tone('sine', f, f * 1.01, .95, .1 * strength, .08, i * .045));
        hiss('bandpass', 850, 2300, .7, .16 * strength, .2); break;
      case 'panther':
        tone('sine', 55, 100, .55, .5 * strength, .045);
        tone('triangle', 160, 65, .38, .11 * strength);
        hiss('lowpass', 800, 200, .32, .17 * strength); break;
      case 'thor':
        tone('sine', 95, 260, .24, .12 * strength, .08);
        hiss('highpass', 1800, 900, .18, .3 * strength, .012, .25);
        hiss('lowpass', 320, 75, 1.2, .65 * strength, .07, .3);
        tone('sine', 48, 26, .95, .36 * strength, .04, .3); break;
      case 'captain':
        [440, 880, 1320].forEach((f, i) => tone('triangle', f, f * .8, .5 - i * .07, .12 * strength, .009, i * .02));
        hiss('highpass', 1800, 4200, .28, .22 * strength); break;
    }
  }
  toggle.addEventListener('click', async () => {
    if (pending) return;
    if (enabled) {
      enabled = false; toggle.setAttribute('aria-pressed', 'false'); label.textContent = 'Sound off';
      document.body.classList.remove('sound-on'); sync(); return;
    }
    pending = true; toggle.disabled = true;
    try {
      if (!audio) init();
      await audio.resume(); enabled = true;
      master.gain.setTargetAtTime(level(), audio.currentTime, .035);
      toggle.setAttribute('aria-pressed', 'true'); label.textContent = 'Sound on'; document.body.classList.add('sound-on');
      play(window.MarvelExperience?.activeHero || 'ironman', true); sync();
    } catch { enabled = false; label.textContent = 'Sound unavailable'; }
    finally { pending = false; toggle.disabled = false; }
  });
  volume.addEventListener('input', () => {
    output.textContent = volume.value + '%';
    if (audio && enabled && !blocked()) master.gain.setTargetAtTime(level(), audio.currentTime, .035);
  });
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(document.body, {attributes: true, attributeFilter: ['class']});
  window.HeroAudio = Object.freeze({play, get enabled() { return enabled; }});
})();
