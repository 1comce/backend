import fs from "fs/promises";
export const uploadFileToTelegram = async (filePath) => {
  const file = await fs.readFile(filePath);
  // const binary = new Blob([file]);
  try {
    const response = await fetch(`${process.env.HOSTNAME}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream", // Indicating that the request body is binary data
      },
      body: file,
    });
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Lỗi khi upload ${filePath}:`, error.message);
    return null;
  }
};
export const getFilePath = async (file_id) => {
  try {
    // Get the file information from Telegram API
    const response = await fetch(
      `${process.env.TELEGRAM_API_URL}${process.env.BOT_TOKEN}/getFile?file_id=${file_id}`
    );
    if (!response.ok) return console.log(`Too many request at file ${file_id}`);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.log(`Error processing file with id ${file_id}:`, error);
  }
};
export const downloadFilePath = async (result, finalDir) => {
  const fileResponse = await fetch(
    `${process.env.TELEGRAM_API_FILE_URL}${process.env.BOT_TOKEN}/${result.file_path}`
  );
  let buffer = await fileResponse.bytes();
  await fs.appendFile(finalDir, buffer);
  console.log("File append success at: ", finalDir);
  buffer = null;
};
export const downloadFileFromTelegram = async (file_id, outputDir) => {
  const result = await getFilePath(file_id);
  await downloadFilePath(result, outputDir);
};
