## How to run locally 👇

(note: neets ai is now sunsetted, so you will need to use elevenlabs or speechify in order to run brainrot mode)
(additional note: you can run rap mode, but I don't yet cover in this readme how to. You can dig in yourself but i will be adding documentation on how to in this readme later)

0. You must have docker installed on your computer (https://www.docker.com/get-started/)
1. create `generate/.env` file with the following values:

```bash
JORDAN_PETERSON_VOICE_ID=jordan-peterson
JOE_ROGAN_VOICE_ID=joe-rogan
BARACK_OBAMA_VOICE_ID=barack-obama
KAMALA_HARRIS_VOICE_ID=kamala-harris
BEN_SHAPIRO_VOICE_ID=ben-shapiro
ANDREW_TATE_VOICE_ID=andrew-tate
JOE_BIDEN_VOICE_ID=joe-biden
DONALD_TRUMP_VOICE_ID=donald-trump
GROQ_API_KEY=YOUR GROQ API KEY HERE
OPENAI_API_KEY=YOUR OPEN AI API KEY HERE
NEETS_API_KEY=YOUR NEETS API KEY HERE
1.5 Note, you should get the actual values for your GROQ, OPENAI, and NEETS api keys before proceeding (scroll down for links on where to get each)

2. go into generate (`cd generate`) and run `chmod +x scripts/start.sh`, and `chmod +x scripts/build.sh`. This will make the scripts executable.
3. now run `./scripts/build.sh` to build the docker image. This will take 5-15 minutes, as there are a lot of dependencies. The image is around 5.5GB.
4. now run `bun install` in ./generate
5. you can now run `./scripts/start.sh` to start the container. There are two modes you can run. regular mode and studio mode. Regular mode executes the localBuild.ts script, and outputs a video in the out directory. Studio mode executes the localBuild.ts script, but doesn't render the video. Instead, it generates the necessary audio and context files for the video, and runs `bun run start` outside of the container. This allows you to edit the actual video code (in `src/Composition.tsx`).in real-time and have it update on the spot. To run in studio mode, run `MODE=studio ./scripts/start.sh`. To run in regular mode, run `./scripts/start.sh`. In order to change what video is generated, you can change the variable values at the top in localBuild.ts. The video generation process can take 10-20 minutes so be patient!
6. Voila! You just made brainrot

#### how to get neets ai credentials:

- https://neets.ai/keys

#### how to get open ai credentials:

- https://platform.openai.com/api-keys

#### how to get groq api credentials:

- https://console.groq.com/keys

#### assets to download

I have removed assets for download except MINECRAFT-0.mp4 (in generate/public/background/). If you want your own GTA / Minecraft / etc. bottom half video just find some on youtube. and add the videos to generate/public/background/ folder.

#### common problems

- Dalle 3 API rate limit exceeded: this is because each dialogue transition has an image, and it is prompted to have 7 dialogue transitions. However, typical tier 1 open ai accounts can only generate 5 images per minute. You might need to reduce the # of dialog transitions if this is the case (in generate/transcript.mjs)
- You don't have enough storage (the image will be around 12.6GB)
```
