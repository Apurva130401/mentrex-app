
import fs from 'fs';
import path from 'path';
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Or Service Role if RLS prevents anon insert
const googleKey = process.env.GOOGLE_API_KEY;

if (!supabaseUrl || !supabaseKey || !googleKey) {
    console.error("Missing environment variables. Check .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(googleKey);

async function getEmbedding(text: string) {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function seed() {
    const filePath = path.join(process.cwd(), 'MENTREX_DASHBOARD_DOCS.md');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Split content by headers to create meaningful chunks
    // This regex splits by "## " or "### " headers
    const chunks = content.split(/(?=^##+ )/gm).filter(c => c.trim().length > 0);

    console.log(`Found ${chunks.length} chunks to seed...`);

    for (const chunk of chunks) {
        console.log(`Processing chunk: ${chunk.substring(0, 50).replace(/\n/g, ' ')}...`);

        try {
            const embedding = await getEmbedding(chunk);

            const { error } = await supabase
                .from('documents')
                .insert({
                    content: chunk,
                    embedding: embedding,
                    metadata: { source: 'seed-script', date: new Date().toISOString() }
                });

            if (error) {
                console.error("Error inserting chunk:", error.message);
            } else {
                console.log("Chunk inserted successfully.");
            }

            // Tiny delay to avoid rate limits
            await new Promise(r => setTimeout(r, 500));

        } catch (e: any) {
            console.error("Failed to embedding/insert chunk:", e.message);
        }
    }

    console.log("Seeding complete!");
}

seed();
