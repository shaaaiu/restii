const axios = require('axios');
const FormData = require('form-data');

const styleMap = {
  photorealistic: 'photorealistic style image',
  cinematic: 'cinematic style image',
  hyperreal: 'hyperrealistic style image',
  portrait: 'portrait style image'
};

const resolutionMap = {
  '512x512': { width: 512, height: 512 },
  '768x768': { width: 768, height: 768 },
  '1024x1024': { width: 1024, height: 1024 },
  '1920x1080': { width: 1920, height: 1080 }
};

module.exports = function (app) {
  async function RealisticImage({ prompt, style = 'photorealistic', resolution = '768x768', seed = null }) {
    const selectedStyle = styleMap[style?.toLowerCase()] || styleMap['photorealistic'];
    const selectedRes = resolutionMap[resolution] || resolutionMap['768x768'];

    const fullPrompt = `${selectedStyle}: ${prompt}`;
    const form = new FormData();
    form.append('action', 'generate_realistic_ai_image');
    form.append('prompt', fullPrompt);
    form.append('seed', (seed || Math.floor(Math.random() * 100000)).toString());
    form.append('width', selectedRes.width.toString());
    form.append('height', selectedRes.height.toString());

    try {
      const res = await axios.post(
        'https://realisticaiimagegenerator.com/wp-admin/admin-ajax.php',
        form,
        {
          headers: {
            ...form.getHeaders(),
            'origin': 'https://realisticaiimagegenerator.com',
            'referer': 'https://realisticaiimagegenerator.com/',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64)',
            'accept': '*/*'
          }
        }
      );

      const json = res.data;
      if (json?.success && json.data?.imageUrl) {
        return { success: true, url: json.data.imageUrl };
      } else {
        return { success: false, error: 'Gagal menghasilkan gambar' };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  app.get('/aiimage/realistic', async (req, res) => {
    const { apikey, text, prompt, style, resolution, seed } = req.query;
    const finalPrompt = text || prompt;

    if (!finalPrompt) {
      return res.status(400).json({
        status: false,
        creator: global.creator,
        message: 'Parameter prompt diperlukan'
      });
    }

    if (!apikey || !global.apikeyp.includes(apikey)) {
      return res.status(403).json({
        status: false,
        creator: global.creator,
        message: 'Apikey tidak valid'
      });
    }

    const result = await RealisticImage({
      prompt: finalPrompt,
      style,
      resolution,
      seed
    });

    if (!result.success) {
      return res.status(500).json({
        status: false,
        creator: global.creator,
        message: result.error
      });
    }

    return res.status(200).json({
      status: true,
      creator: global.creator,
      image: result.url
    });
  });
};
      
