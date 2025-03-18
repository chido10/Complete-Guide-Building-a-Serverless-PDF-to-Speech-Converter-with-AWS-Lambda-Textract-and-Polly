# Complete-Guide-Building-a-Serverless-PDF-to-Speech-Converter-with-AWS-Lambda-Textract-and-Polly

## Project Overview
This guide walks through creating a serverless **PDF-to-speech** converter using **AWS Lambda**, **Amazon Textract** (for text extraction), and **Amazon Polly** (for speech synthesis). The system manages large documents by **segmenting text** into smaller chunks, converting each chunk to audio, and storing the resulting files in **Amazon S3**.

---

## Architectural Diagram
![image](https://github.com/user-attachments/assets/50068163-df41-4df1-ba4f-039be4e85858)

*This diagram shows a serverless workflow for converting PDF files to audio. Users upload PDF documents to an S3 input bucket, which triggers a Lambda function. That function extracts text via Amazon Textract, chunks the text, then uses Amazon Polly to convert each chunk to speech. Resulting MP3 files are stored in an S3 output bucket, all secured through IAM roles with logs accessible in CloudWatch.*

---

## AWS Services Used
- **AWS Lambda**: Serverless compute platform  
- **Amazon Textract**: Extracts text from PDFs  
- **Amazon Polly**: Converts text to speech (MP3)  
- **Amazon S3**: Stores PDF inputs and audio outputs

![image](https://github.com/user-attachments/assets/a152114d-12fe-49ae-b989-6fc0d8b8019b)  
![image](https://github.com/user-attachments/assets/f4b13a0e-9af9-4013-90e8-a02e71eeccbe)  
![image](https://github.com/user-attachments/assets/2b0288b0-5c8c-4c65-a043-66540d7b7ea6)

---

## Prerequisites
- **AWS account** with access to Lambda, Textract, Polly, and S3

---

## Step-by-Step Implementation

### 1. Upload the PDF to S3
1. Create an S3 bucket (or use an existing one).
2. **Upload** your PDF file. For example, a 1.5 MB PDF named `SR23809044938.pdf`.

![image](https://github.com/user-attachments/assets/5fa519d1-2057-45be-a1cc-04a5fc19bc9d)

---

### 2. IAM Role Creation
Create an **IAM role** named `lambdaaccess` with the necessary permissions:
1. Attach policies for **Textract**, **Polly**, **S3**, and **Lambda** execution (if needed).
2. Ensure the role allows asynchronous Textract processing and reading/writing to S3.

![image](https://github.com/user-attachments/assets/944eb013-773e-4df0-825c-5687f20d0fc1)  
![image](https://github.com/user-attachments/assets/4fe1e1e1-a8f7-4b5b-8ce2-2613fcfd67b7)

---

### 3. Create Lambda Function
1. In the **Lambda Console**, click **Create function**.
2. Configure the function:
   - **Name**: `PollyTranslator`  
   - **Runtime**: Node.js 18.x  
   - **Architecture**: x86_64  
   - **Role**: Select existing role (`lambdaaccess`)  
   - **Memory**: 128 MB (adjust as needed)  
   - **Timeout**: 5 minutes (adjust for large PDFs)

![image](https://github.com/user-attachments/assets/259a84fb-3918-410b-986d-42bca4af9a93)

---

### 4. Install Node.js Dependencies
From **CloudShell** or your local terminal (with AWS access):
```bash
npm init -y
npm install @aws-sdk/client-polly @aws-sdk/client-s3 @aws-sdk/client-textract @aws-sdk/lib-storage
```
![image](https://github.com/user-attachments/assets/689345ec-0b1b-4921-84a8-3a21f0b51fc2)

---

### 5. Lambda Function Code
Upload or paste the **JavaScript** code in the Lambda console, which does the following:
- Initiates a **Textract** asynchronous job to extract text from the PDF.
- **Polls** for job completion.
- **Chunks** extracted text (at ~2900 characters per chunk).
- Uses **Polly** to convert each text chunk to speech.
- Uploads MP3 files to **S3** (output bucket).

![image](https://github.com/user-attachments/assets/bf6850b2-e82a-4dea-88ce-47f16f8a1bdc)

*(Ensure you have S3 references for both input and output buckets, and update region/ARNs as needed.)*

---

### 6. Lambda Test Event
Create a test event in the Lambda console to trigger the function, for example:
```json
{
  "bucket": "your-input-bucket-name",
  "objectKey": "SR23809044938.pdf"
}
```
![image](https://github.com/user-attachments/assets/b391c74f-fa43-405c-8437-33ce737e4939)

---

## Result Explanation
After a successful run, the Lambda function generates **multiple audio files**—one file per text chunk—within your S3 **output bucket**. For a long PDF, you might see:

```
SR23809044938_part1.mp3
SR23809044938_part2.mp3
...
SR23809044938_partN.mp3
```
The original PDF remains in the input bucket. Each MP3 correlates to a segment of extracted text from the PDF.

![image](https://github.com/user-attachments/assets/fc556729-d6e0-4428-9761-87a43679b47b)

---

## Technical Considerations

### Text Chunking Strategy
- Chunks text around **2900 characters** to avoid **Polly’s 3000-character limit** per request.

### Asynchronous Processing
- Uses Textract’s **asynchronous** API for large document handling.
- Polls for job completion before retrieving extracted text.

### Error Handling
- Handles exceptions from Textract, Polly, and S3 uploads.
- Throws or logs errors for troubleshooting in **CloudWatch**.

---

## Service Limits

### Amazon Textract
- **Max PDF Size**: 500 MB  
- **Default Concurrent Async Jobs**: 5  
- PDF must be **searchable or scanned**.

### Amazon Polly
- **Text limit**: 3000 characters per request  
- **Voice**: e.g., *Arthur* (British male)  
- Additional cost for *Neural* voices.

### Amazon S3
- **Object size limit**: 5 TB (use multipart upload for >5 GB).  
- Store input PDFs and output MP3s.

### AWS Lambda
- **Max memory**: 10,240 MB  
- **Timeout**: up to 15 minutes  

---

## Performance Optimization
- Start with **128 MB memory** and increase if needed.  
- Set **timeout** high enough for large PDFs.  
- Streamline PDF content (e.g., compress or remove unnecessary pages).

---

## Monitoring & Logging
- **CloudWatch Logs** track:
  - Text chunking details  
  - S3 upload status  
  - Errors and performance metrics  

---

## Future Enhancements

1. **Audio File Combination**  
   - Use **ffmpeg-lambda-layer** to merge MP3 chunks into a single file.
2. **Progress Tracking**  
   - Store real-time progress in DynamoDB or send SNS notifications.
3. **API Gateway Integration**  
   - Offer HTTP endpoints for dynamic PDF uploads, job status, and retrieving MP3 links.

---

## Cost Optimization
- **Optimize** PDFs (reduce pages, compress content) to lower Textract usage.  
- **Cache** Polly outputs to avoid repeated conversions.  
- **Monitor** Lambda usage and right-size memory/timeouts.

---

### Common Issues & Solutions
- **Polly Character Limit**: Keep chunk size <3000 chars.  
- **Timeouts**: Increase Lambda timeout for large PDFs.  
- **Memory Issues**: Increase Lambda memory if encountering `OutOfMemoryError`.

---

## Best Practices
- Validate PDF integrity before processing.  
- Use consistent naming conventions for files.  
- Restrict IAM roles to least privileges needed.

---

## Conclusion
This project demonstrates a **robust, scalable serverless** solution that integrates multiple AWS services for **efficient PDF-to-speech** conversion. By combining **Lambda**, **Textract**, **Polly**, and **S3**, you can handle large PDFs, generate high-quality audio, and deliver a fully serverless document processing pipeline suitable for enterprise deployments.

---

**Enjoy building your PDF-to-speech converter!**
