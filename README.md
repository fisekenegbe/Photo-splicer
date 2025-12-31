---
title: Photo Splicer
emoji: ✂️
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
app_port: 3000
---

# Photo Splicer ✂️

A powerful, privacy-focused background removal tool that runs entirely on your own hardware (or cloud container). Unlike other tools that send your photos to a paid API, Photo Splicer processes everything locally using the **Modnet** neural network.

## ✨ Features

* **100% Free & Unlimited:** No credits, no API keys, and no subscriptions.
* **Privacy First:** Images are processed in your container and immediately deleted. They are never stored permanently.
* **High Precision:** Uses the `Xenova/modnet` model for high-quality human subject isolation.
* **Server-Side Processing:** Utilizes `Sharp` for pixel-perfect transparency masking and image composition.
* **Docker Ready:** Configured to run smoothly in a containerized environment (like Hugging Face Spaces).

## 🚀 How It Works

1.  **Upload:** You send an image to the API.
2.  **Analyze:** The app saves a temporary copy and runs it through the `Modnet` AI model.
3.  **Mask:** The AI identifies the subject and creates a black-and-white "alpha mask."
4.  **Cut:** The app uses the `Sharp` library to apply that mask, physically cutting the background pixels out of the image.
5.  **Deliver:** You get back a pure, transparent PNG file.

## 🛠️ Installation & Setup

If you want to run this on your own computer instead of the cloud:

```bash
# 1. Clone the repository
git clone [https://github.com/fisekenegbe/Photo-Splicer.git](https://github.com/fisekenegbe/Photo-Splicer.git)

# 2. Install dependencies
npm install

# 3. Start the server
npm run dev
📦 Tech Stack
Framework: Next.js

AI Engine: Transformers.js (@huggingface/transformers)

Image Processing: Sharp

Model: Xenova/modnet

Built with ❤️ by Fisekenegbe