const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { TextractClient, StartDocumentTextDetectionCommand, GetDocumentTextDetectionCommand } = require("@aws-sdk/client-textract");
const { Upload } = require("@aws-sdk/lib-storage");

const pollyClient = new PollyClient();
const s3Client = new S3Client();
const textractClient = new TextractClient();

// Function to chunk text into smaller pieces
function chunkText(text, maxLength = 2900) {
    const words = text.split(' ');
    const chunks = [];
    let currentChunk = '';

    for (const word of words) {
        if ((currentChunk + ' ' + word).length <= maxLength) {
            currentChunk += (currentChunk ? ' ' : '') + word;
        } else {
            chunks.push(currentChunk);
            currentChunk = word;
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}

// Function to synthesize speech for a chunk
async function synthesizeChunk(text) {
    const pollyParams = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: 'Arthur',
        Engine: 'neural'
    };

    const synthesizeCommand = new SynthesizeSpeechCommand(pollyParams);
    return pollyClient.send(synthesizeCommand);
}

exports.handler = async (event) => {
    try {
        // Start Textract job
        const textractParams = {
            DocumentLocation: {
                S3Object: {
                    Bucket: 'my-aws-practical-projects',
                    Name: 'Polly Project/SR23809044938.pdf'
                }
            }
        };

        const startCommand = new StartDocumentTextDetectionCommand(textractParams);
        const startResponse = await textractClient.send(startCommand);
        const jobId = startResponse.JobId;

        // Wait for Textract job to complete
        let textractResult;
        while (true) {
            const getResultsCommand = new GetDocumentTextDetectionCommand({ JobId: jobId });
            textractResult = await textractClient.send(getResultsCommand);
            
            if (textractResult.JobStatus === 'SUCCEEDED') break;
            if (textractResult.JobStatus === 'FAILED') throw new Error('Textract job failed');
            
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Extract text from Textract response
        const fullText = textractResult.Blocks
            .filter(block => block.BlockType === 'LINE')
            .map(block => block.Text)
            .join(' ');

        // Split text into chunks
        const chunks = chunkText(fullText);
        console.log(`Split text into ${chunks.length} chunks`);

        // Process each chunk
        for (let i = 0; i < chunks.length; i++) {
            const pollyResponse = await synthesizeChunk(chunks[i]);
            
            // Upload each chunk to S3
            const chunkKey = `Polly Project/SR23809044938_part${i + 1}.mp3`;
            
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: 'my-aws-practical-projects',
                    Key: chunkKey,
                    Body: pollyResponse.AudioStream,
                    ContentType: 'audio/mpeg'
                }
            });

            await upload.done();
            console.log(`Uploaded chunk ${i + 1}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: `Created ${chunks.length} audio files in Polly Project/`,
                numberOfChunks: chunks.length,
                jobId: jobId
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Internal server error', 
                error: error.message 
            })
        };
    }
};