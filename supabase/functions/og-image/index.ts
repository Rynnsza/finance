import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import satori from "https://esm.sh/satori@0.10.1";
import { initWasm, Resvg } from "https://esm.sh/@resvg/resvg-wasm@2.4.1";

// WASM initialization
let wasmInitialized = false;

async function initializeWasm() {
  if (wasmInitialized) return;
  const wasmUrl = "https://esm.sh/@resvg/resvg-wasm@2.4.1/index_bg.wasm";
  const wasmRes = await fetch(wasmUrl);
  if (!wasmRes.ok) throw new Error("Failed to load WASM");
  const wasmBuffer = await wasmRes.arrayBuffer();
  await initWasm(wasmBuffer);
  wasmInitialized = true;
}

// Load Font (Raw GitHub URL)
const fontUrl = "https://raw.githubusercontent.com/googlefonts/dm-fonts/main/Sans/Exports/DMSans-Bold.ttf";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title") || "Aemy Finance";
    const desc = url.searchParams.get("desc") || "Simple Personal Shared Finance";

    await initializeWasm();

    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) throw new Error(`Failed to load font: ${fontRes.statusText}`);
    const fontData = await fontRes.arrayBuffer();

    // Render SVG with Satori
    const svg = await satori(
      {
        type: "div",
        props: {
          style: {
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            padding: "80px",
          },
          children: [
            // Logo/Icon Section
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100px",
                  height: "100px",
                  borderRadius: "24px",
                  background: "linear-gradient(to bottom, #cf284e, #cf284e90)",
                  marginBottom: "40px",
                },
                children: [
                  {
                    type: "svg",
                    props: {
                      viewBox: "0 0 24 24",
                      width: "50",
                      height: "50",
                      fill: "none",
                      stroke: "white",
                      strokeWidth: "2",
                      children: [
                        {
                          type: "path",
                          props: { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }
                        },
                        {
                          type: "path",
                          props: { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            // Text Section
            {
              type: "h1",
              props: {
                style: {
                  fontSize: "72px",
                  fontWeight: "900",
                  color: "white",
                  margin: "0",
                  textAlign: "center",
                },
                children: title,
              },
            },
            {
              type: "p",
              props: {
                style: {
                  fontSize: "32px",
                  color: "#a1a1aa",
                  marginTop: "20px",
                  textAlign: "center",
                },
                children: desc,
              },
            },
            // Bottom Branding
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  bottom: "60px",
                  display: "flex",
                  alignItems: "center",
                },
                children: [
                   {
                    type: "span",
                    props: {
                      style: { fontSize: "24px", fontWeight: "bold", color: "#cf284e" },
                      children: "AEMY FINANCE"
                    }
                  }
                ]
              }
            }
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "DMSans",
            data: fontData,
            weight: 700,
            style: "normal",
          },
        ],
      }
    );

    // Convert SVG to PNG
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
