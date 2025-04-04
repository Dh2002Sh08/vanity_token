import { generateSigner } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

export default async function handler(req, res) {
    const { prefix } = req.query;

    if (!prefix) {
        return res.status(400).json({ error: 'Prefix is required' });
    }

    try {
        const umi = createUmi('https://api.devnet.solana.com');
        const mint = generateVanityMintSigner(umi, prefix); // Returns a signer with publicKey and secretKey

        console.log("Generated Mint Public Key:", mint.publicKey.toString());

        // Return the full mint object including publicKey and secretKey
        return res.status(200).json({
            publicKey: mint.publicKey.toString(),
            secretKey: Array.from(mint.secretKey) // Convert Uint8Array to array for JSON serialization
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

function generateVanityMintSigner(umi, targetPrefix) {
    let mint;
    let mintAddress;
    let attempts = 0;

    console.log(`Starting search for vanity token mint with prefix "${targetPrefix}"...`);
    console.time('Search Duration');

    do {
        // Generate a new signer (keypair)
        mint = generateSigner(umi);
        mintAddress = mint.publicKey.toString(); // Convert to string for prefix check
        attempts++;

        if (attempts % 1000 === 0) {
            console.log(`Still searching... ${attempts} attempts`);
        }
    } while (!mintAddress.startsWith(targetPrefix));

    console.timeEnd('Search Duration');
    console.log(`Found vanity mint ${mintAddress} after ${attempts} attempts`);

    return mint; // Return the full signer object
}