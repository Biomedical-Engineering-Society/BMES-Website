import * as dotenv from "dotenv";
dotenv.config();

async function nuclearTestV2() {
  console.log("☢️ STARTING NUCLEAR TEST V2 (NEW ROUTER)");
  
  const token = process.env.HUGGINGFACE_TOKEN;
  // Let's try the most reliable model they have
  const model = "mistralai/Mistral-7B-Instruct-v0.3"; 
  
  // 🟢 UPDATED URL: Using the new 'router' subdomain
  const url = `https://router.huggingface.co/hf-inference/models/${model}`;

  console.log(`📡 Sending RAW HTTP request to: ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "System: You are helpful.\nUser: Are you working?\nAssistant:",
        parameters: { 
          max_new_tokens: 10,
          return_full_text: false 
        }
      }),
    });

    console.log(`\n📨 Server Responded with Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ ERROR BODY:");
      console.log(errorText);
      console.log("\nCONCLUSION: The server is actively rejecting you.");
    } else {
      const data = await response.json();
      console.log("✅ SUCCESS! The server is alive.");
      console.log("Response:", JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("💀 NETWORK CRASH:", error);
  }
}

nuclearTestV2();