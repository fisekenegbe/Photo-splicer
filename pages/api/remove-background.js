import { pipeline, env } from '@huggingface/transformers';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';

env.allowLocalModels = false;
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

  let tempFilePath = '';
  let maskPath = '';

  try {
    const inputBuffer = await streamToBuffer(req);
    
    tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.png`);
    fs.writeFileSync(tempFilePath, inputBuffer);

    const segmenter = await BackgroundRemovalSingleton.getInstance();
    const output = await segmenter(tempFilePath);
    
    const mask = output[0].mask;
    maskPath = path.join(os.tmpdir(), `mask_${Date.now()}.png`);
    await mask.save(maskPath);

    const originalImage = sharp(tempFilePath);
    const { width, height } = await originalImage.metadata();

    const maskBuffer = await sharp(maskPath)
      .resize(width, height)
      .grayscale()
      .toBuffer();

    const finalBuffer = await originalImage
      .joinChannel(maskBuffer)
      .toFormat('png')
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(finalBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing image', error: error.message });
  } finally {
    try {
        if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        if (maskPath && fs.existsSync(maskPath)) fs.unlinkSync(maskPath);
    } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
    }
  }
}