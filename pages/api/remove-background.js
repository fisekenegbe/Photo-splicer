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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // ---  PASTE YOUR API KEY HERE  ---
    const API_KEY = process.env.REMOVE_BG_API_KEY; 
    // -------------------------------------

    if (API_KEY === "PASTE_YOUR_REMOVE_BG_KEY_HERE") {
      throw new Error("Missing API Key. Please open pages/api/remove-background.js and paste your key.");
    }

    
    const inputBuffer = await streamToBuffer(req);


    const formData = new FormData();
    formData.append("image_file", new Blob([inputBuffer]), "image.png");
    formData.append("size", "auto");


    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Remove.bg Error:", errorText);
      throw new Error(`Remove.bg API Error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "image/png");
    res.send(outputBuffer);

  } catch (error) {
    console.error("Server processing error:", error);
    res.status(500).json({ message: error.message || 'Failed to process image' });
  }
}