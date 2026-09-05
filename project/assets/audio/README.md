# Guided activity ambience

Place the licensed, royalty-free ambient track at:

`assets/audio/calm-forest.mp3`

Natural ambience without speech or lyrics is preferred. After adding the file,
set `LOCAL_AMBIENT_AUDIO` in `app/lib/guided-audio.ts` to the documented
`require()` line there. Until then, guided activities remain fully usable and
the optional `EXPO_PUBLIC_GUIDED_AMBIENT_AUDIO_URL` fallback can be used.
