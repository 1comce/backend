import path from "path";
import ffmpeg from "fluent-ffmpeg";

const MAXIMUM_BITRATE_720P = 5 * 10 ** 6; // 5Mbps
const MAXIMUM_BITRATE_1080P = 8 * 10 ** 6; // 8Mbps
const MAXIMUM_BITRATE_1440P = 16 * 10 ** 6; // 16Mbps

/**
 * Checks if the video has an audio stream.
 * @param {string} filePath - Path to the video file.
 * @returns {Promise<boolean>} - True if audio is present, false otherwise.
 */
export const checkVideoHasAudio = async (filePath) => {
  try {
    const metadata = await ffmpeg.ffprobe(filePath);
    return metadata.streams.some((stream) => stream.codec_type === "audio");
  } catch (err) {
    throw new Error(`Failed to probe audio: ${err.message}`);
  }
};

/**
 * Retrieves the bitrate of the video stream.
 * @param {string} filePath - Path to the video file.
 * @returns {Promise<number>} - Bitrate of the video stream.
 */
const getBitrate = async (filePath) => {
  try {
    const metadata = await ffmpeg.ffprobe(filePath);
    const videoStream = metadata.streams.find(
      (stream) => stream.codec_type === "video"
    );
    if (videoStream && videoStream.bit_rate) {
      return Number(videoStream.bit_rate);
    }
    throw new Error("No video stream found or bitrate not available");
  } catch (err) {
    throw new Error(`Failed to get bitrate: ${err.message}`);
  }
};

/**
 * Retrieves the resolution (width and height) of the video.
 * @param {string} filePath - Path to the video file.
 * @returns {Promise<{width: number, height: number}>} - Resolution of the video.
 */
const getResolution = async (filePath) => {
  try {
    const metadata = await ffmpeg.ffprobe(filePath);
    const videoStream = metadata.streams.find(
      (stream) => stream.codec_type === "video"
    );
    if (videoStream) {
      return {
        width: videoStream.width,
        height: videoStream.height,
      };
    }
    throw new Error("No video stream found");
  } catch (err) {
    throw new Error(`Failed to get resolution: ${err.message}`);
  }
};

/**
 * Calculates the width for a given height while maintaining aspect ratio.
 * Ensures the width is even for FFmpeg compatibility.
 * @param {number} height - Desired height.
 * @param {object} resolution - Original resolution {width, height}.
 * @returns {number} - Calculated width.
 */
const getWidth = (height, resolution) => {
  const width = Math.round((height * resolution.width) / resolution.height);
  return width % 2 === 0 ? width : width + 1;
};

// Encoding Functions with fluent-ffmpeg
const encodeMax720 = ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution,
}) => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions([
        "-preset veryslow",
        "-g 48",
        "-crf 30",
        "-sc_threshold 0",
        "-map 0:0", // Video stream
        ...(isHasAudio ? ["-map 0:1"] : []), // Audio stream if present
        `-s:v:0 ${getWidth(720, resolution)}x720`,
        "-c:v:0 libx264",
        `-b:v:0 ${bitrate[720]}`,
        "-c:a copy",
        `-var_stream_map ${isHasAudio ? "v:0,a:0" : "v:0"}`,
        "-master_pl_name master.m3u8",
        "-f hls",
        "-hls_time 6",
        "-hls_flags independent_segments",
        "-hls_playlist_type vod",
        "-hls_segment_type fmp4",
        "-hls_list_size 0",
      ])
      .output(outputPath)
      .outputOptions([`-hls_segment_filename ${outputSegmentPath}`])
      .on("end", () => resolve(true))
      .on("error", (err) => reject(err));

    command.run();
  });
};

const encodeMax1080 = ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution,
}) => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions([
        "-preset veryslow",
        "-g 48",
        "-crf 17",
        "-sc_threshold 0",
        ...(isHasAudio
          ? ["-map 0:0", "-map 0:1", "-map 0:0", "-map 0:1"]
          : ["-map 0:0", "-map 0:0"]),
        `-s:v:0 ${getWidth(720, resolution)}x720`,
        "-c:v:0 libx264",
        `-b:v:0 ${bitrate[720]}`,
        `-s:v:1 ${getWidth(1080, resolution)}x1080`,
        "-c:v:1 libx264",
        `-b:v:1 ${bitrate[1080]}`,
        "-c:a copy",
        `-var_stream_map ${isHasAudio ? "v:0,a:0 v:1,a:1" : "v:0 v:1"}`,
        "-master_pl_name master.m3u8",
        "-f hls",
        "-hls_time 6",
        "-hls_list_size 0",
      ])
      .output(outputPath)
      .outputOptions([`-hls_segment_filename ${outputSegmentPath}`])
      .on("end", () => resolve(true))
      .on("error", (err) => reject(err));

    command.run();
  });
};

const encodeMax1440 = ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution,
}) => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions([
        "-preset veryslow",
        "-g 48",
        "-crf 17",
        "-sc_threshold 0",
        ...(isHasAudio
          ? [
              "-map 0:0",
              "-map 0:1",
              "-map 0:0",
              "-map 0:1",
              "-map 0:0",
              "-map 0:1",
            ]
          : ["-map 0:0", "-map 0:0", "-map 0:0"]),
        `-s:v:0 ${getWidth(720, resolution)}x720`,
        "-c:v:0 libx264",
        `-b:v:0 ${bitrate[720]}`,
        `-s:v:1 ${getWidth(1080, resolution)}x1080`,
        "-c:v:1 libx264",
        `-b:v:1 ${bitrate[1080]}`,
        `-s:v:2 ${getWidth(1440, resolution)}x1440`,
        "-c:v:2 libx264",
        `-b:v:2 ${bitrate[1440]}`,
        "-c:a copy",
        `-var_stream_map ${
          isHasAudio ? "v:0,a:0 v:1,a:1 v:2,a:2" : "v:0 v:1 v:2"
        }`,
        "-master_pl_name master.m3u8",
        "-f hls",
        "-hls_time 6",
        "-hls_list_size 0",
      ])
      .output(outputPath)
      .outputOptions([`-hls_segment_filename ${outputSegmentPath}`])
      .on("end", () => resolve(true))
      .on("error", (err) => reject(err));

    command.run();
  });
};

const encodeMaxOriginal = ({
  bitrate,
  inputPath,
  isHasAudio,
  outputPath,
  outputSegmentPath,
  resolution,
}) => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .outputOptions([
        "-preset veryslow",
        "-g 48",
        "-crf 30",
        "-sc_threshold 0",
        ...(isHasAudio
          ? [
              "-map 0:0",
              "-map 0:1",
              "-map 0:0",
              "-map 0:1",
              "-map 0:0",
              "-map 0:1",
            ]
          : ["-map 0:0", "-map 0:0", "-map 0:0"]),
        `-s:v:0 ${getWidth(720, resolution)}x720`,
        "-c:v:0 libx264",
        `-b:v:0 ${bitrate[720]}`,
        `-s:v:1 ${getWidth(1080, resolution)}x1080`,
        "-c:v:1 libx264",
        `-b:v:1 ${bitrate[1080]}`,
        `-s:v:2 ${resolution.width}x${resolution.height}`,
        "-c:v:2 libx264",
        `-b:v:2 ${bitrate.original}`,
        "-c:a copy",
        `-var_stream_map ${
          isHasAudio ? "v:0,a:0 v:1,a:1 v:2,a:2" : "v:0 v:1 v:2"
        }`,
        "-master_pl_name master.m3u8",
        "-f hls",
        "-hls_time 4",
        "-hls_list_size 0",
      ])
      .output(outputPath)
      .outputOptions([`-hls_segment_filename ${outputSegmentPath}`])
      .on("end", () => resolve(true))
      .on("error", (err) => reject(err));

    command.run();
  });
};

// Main encoding function
export const encodeHLSWithMultipleVideoStreams = async (inputPath) => {
  try {
    const [bitrate, resolution] = await Promise.all([
      getBitrate(inputPath),
      getResolution(inputPath),
    ]);
    const parentFolder = path.join(inputPath, "..");
    const outputSegmentPath = path.join(parentFolder, "v%v/fileSequence%d.m4s");
    const outputPath = path.join(parentFolder, "v%v/prog_index.m3u8");
    const bitrate720 =
      bitrate > MAXIMUM_BITRATE_720P ? MAXIMUM_BITRATE_720P : bitrate;
    const bitrate1080 =
      bitrate > MAXIMUM_BITRATE_1080P ? MAXIMUM_BITRATE_1080P : bitrate;
    const bitrate1440 =
      bitrate > MAXIMUM_BITRATE_1440P ? MAXIMUM_BITRATE_1440P : bitrate;

    const isHasAudio = await checkVideoHasAudio(inputPath);
    let encodeFunc = encodeMax720;
    if (resolution.height > 720) {
      encodeFunc = encodeMax1080;
    }
    if (resolution.height > 1080) {
      encodeFunc = encodeMax1440;
    }
    if (resolution.height > 1440) {
      encodeFunc = encodeMaxOriginal;
    }

    await encodeFunc({
      bitrate: {
        720: bitrate720,
        1080: bitrate1080,
        1440: bitrate1440,
        original: bitrate,
      },
      inputPath,
      isHasAudio,
      outputPath,
      outputSegmentPath,
      resolution,
    });
    return `${parentFolder}/master.m3u8`;
  } catch (err) {
    console.error("Encoding failed:", err);
    return null;
  }
};
export const generateThumbnail = (
  videoPath,
  outputFolder = "uploads/thumbnails",
  timeInSeconds = 3
) => {
  return new Promise((resolve, reject) => {
    const baseName = path.basename(videoPath, path.extname(videoPath)); // Get the basename of the video
    const thumbnailPath = path.join(outputFolder, `${baseName}-thumbnail.jpg`); // Generate the full thumbnail path
    ffmpeg(videoPath)
      .on("end", () => {
        console.log("Thumbnail created!");
        resolve(thumbnailPath);
      })
      .on("error", reject)
      .screenshots({
        count: 1,
        timemarks: [timeInSeconds],
        folder: outputFolder,
        filename: "%b-thumbnail.jpg", // %b = basename of input
      });
  });
};
// Example usage
// encodeHLSWithMultipleVideoStreams("/path/to/video.mp4").then(console.log);
