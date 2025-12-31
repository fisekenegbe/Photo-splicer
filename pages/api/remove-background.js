import sharp from 'sharp';
import { pipeline, env } from '@huggingface/transformers';
import fs from 'fs';
import path from 'path';
import os from 'os';

env.allowLocalModels = true;
env.useBrowserCache = false;

class BackgroundRemovalSingleton {
  static task = 'image-segmentation';
  static model = 'Xenova/modnet';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const inputBuffer = await streamToBuffer(req);
    
const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.png`);
fs.writeFileSync(tempFilePath, inputBuffer);
const segmenter = await BackgroundRemovalSingleton.getInstance();
const output = await segmenter(tempFilePath);
fs.unlinkSync(tempFilePath);

    const maskBuffer = await sharp(mask.data, {
      raw: { width: mask.width, height: mask.height, channels: mask.channels },
    })
    .resize(mask.width, mask.height)
    .toFormat('png')
    .toBuffer();

    const finalBuffer = await sharp(inputBuffer)
      .resize(mask.width, mask.height)
      .composite([{ input: maskBuffer, blend: 'dest-in' }])
      .toFormat('png')
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(finalBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  }
}