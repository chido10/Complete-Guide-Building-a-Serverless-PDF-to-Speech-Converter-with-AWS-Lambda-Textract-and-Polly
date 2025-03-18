# Complete-Guide-Building-a-Serverless-PDF-to-Speech-Converter-with-AWS-Lambda-Textract-and-Polly

### Project Overview
This guide walks us through creating a serverless PDF-to-speech converter utilizing AWS Lambda, Amazon Textract for text extraction, and Amazon Polly for generating audio. The solution effectively manages large documents by segmenting text into manageable chunks, converting them into audio, and storing the resulting files in Amazon S3.

### Architectural Diagram
 ![image](https://github.com/user-attachments/assets/50068163-df41-4df1-ba4f-039be4e85858)

*This diagram depicts a serverless solution for converting PDF documents to audio files. It shows the complete process flow starting with a user uploading PDF files to an S3 input bucket. When files arrive, they trigger a Lambda function that orchestrates the conversion process. The Lambda function first uses Amazon Textract to extract text from the PDFs, chunks this text into manageable segments, and then uses Amazon Polly to convert each text chunk into speech. The resulting MP3 files are stored in an S3 output bucket where users can retrieve them. The diagram also includes the security layer with IAM roles and monitoring through CloudWatch logs. The entire workflow demonstrates how multiple AWS services integrate to create a complete serverless document processing solution.*

### AWS Services Used:
•	AWS Lambda: Serverless execution
•	Amazon Textract: Extracts text from PDFs
•	Amazon Polly: Converts extracted text to speech
•	Amazon S3: Storage for PDFs and audio files
 ![image](https://github.com/user-attachments/assets/a152114d-12fe-49ae-b989-6fc0d8b8019b)
![image](https://github.com/user-attachments/assets/f4b13a0e-9af9-4013-90e8-a02e71eeccbe)
![image](https://github.com/user-attachments/assets/2b0288b0-5c8c-4c65-a043-66540d7b7ea6)

 

### Prerequisites
•	AWS account with access to Lambda, Textract, Polly, and S3
Step-by-Step Implementation
Upload the pdf to s3
We uploaded a long pdf file to our designated bucket in S3. The file is 1.5 mb. 
 ![image](https://github.com/user-attachments/assets/5fa519d1-2057-45be-a1cc-04a5fc19bc9d)


IAM Role Creation
Create an IAM role named lambdaaccess with the required permissions:
 ![image](https://github.com/user-attachments/assets/944eb013-773e-4df0-825c-5687f20d0fc1)

•	IAM Role Setup
Create an IAM role (lambdaaccess) with permissions:
 ![image](https://github.com/user-attachments/assets/4fe1e1e1-a8f7-4b5b-8ce2-2613fcfd67b7)

 
Create Lambda Function
Set up your Lambda function as shown below:
 ![image](https://github.com/user-attachments/assets/259a84fb-3918-410b-986d-42bca4af9a93)


•	Function name: PollyTranslator
•	Runtime: Node.js 18.x
•	Architecture: x86_64
•	Role: Select existing IAM role (lambdaaccess)
•	Memory: 128 MB
•	Timeout: 5 minutes

Install Node.js Dependencies
Use your terminal or CloudShell to install dependencies:
Run commands in CloudShell or terminal:
 ![image](https://github.com/user-attachments/assets/689345ec-0b1b-4921-84a8-3a21f0b51fc2)

npm init -y
npm install @aws-sdk/client-polly @aws-sdk/client-s3 @aws-sdk/client-textract @aws-sdk/lib-storage

Lambda Function Code
Here's the complete Lambda function code setup: 
 ![image](https://github.com/user-attachments/assets/bf6850b2-e82a-4dea-88ce-47f16f8a1bdc)

Implement the provided JavaScript code which:
•	Initiates Textract asynchronous job for text extraction
•	Polls for completion
•	Chunks extracted text
•	Converts text chunks to speech with Polly
•	Uploads audio to S3

Lambda Test Event
Set up your test event in Lambda as illustrated:
 ![image](https://github.com/user-attachments/assets/b391c74f-fa43-405c-8437-33ce737e4939)

### Result Explanation
Upon successful execution, the Lambda function generates multiple audio files, each corresponding to a chunk of text extracted from the original PDF. The number of files produced depends on the length and complexity of the original document. Below is an example screenshot illustrating multiple audio files (.mp3) stored in S3 after processing a PDF:
 ![image](https://github.com/user-attachments/assets/fc556729-d6e0-4428-9761-87a43679b47b)

The files are named sequentially (e.g., SR23809044938_part1.mp3, SR23809044938_part2.mp3, etc.), representing different segments of the PDF converted into speech. The original PDF (SR23809044938.pdf) is retained alongside the generated audio.

### Technical Considerations
Text Chunking Strategy
•	Chunks text at 2900 characters to avoid Polly's 3000-character limit.
Asynchronous Processing
•	Uses Textract's asynchronous API for reliable handling of large documents.
Error Handling
•	Handles errors from Textract, Polly, and S3 uploads effectively.

### Service Limits
Amazon Textract:
•	Max PDF size: 500MB
•	Concurrent Async Jobs: 5 by default
•	PDF must be searchable or scanned

Amazon Polly:
Ensure you've attached the necessary Polly permissions to your IAM role:
•	Text limit: 3000 characters per request
•	Voice used: Arthur (British male)
•	Higher cost for neural voices

Amazon S3:
Upload your input PDF to the specified S3 bucket:
•	Object size limit: 5 TB (multipart upload for files >5 GB)

AWS Lambda:
•	Max memory: 10,240 MB
•	Timeout: up to 15 minutes

### Performance Optimization
•	Start with 128 MB memory allocation and adjust based on requirements
•	Set timeout appropriately to handle large documents

### Monitoring & Logging
Monitor the Lambda execution and logs via CloudWatch:
Logs include:
•	Text chunking details
•	Upload statuses
•	Error logs via CloudWatch

### Future Enhancements
Audio File Combination
Implement audio concatenation for continuous playback using ffmpeg-lambda-layer.
Progress Tracking
Implement real-time progress tracking stored in DynamoDB.
API Gateway Integration
Provide HTTP API endpoints for dynamic PDF uploads and conversion requests.

### Cost Optimization
•	Optimize PDFs before upload to reduce Textract cost
•	Cache repeated Polly audio to reduce redundant conversions
•	Monitor Lambda usage and adjust concurrency and memory allocation

#### Common Issues & Solutions
•	Polly Character Limit: Reduce chunk size to below 3000 characters
•	Timeouts: Increase Lambda timeout settings
•	Memory Issues: Increase Lambda memory allocation if necessary

### Best Practices
•	Optimize input PDFs
•	Follow file naming conventions
•	Validate PDFs before processing

### Conclusion
This project demonstrates a robust, scalable serverless solution that integrates multiple AWS services, providing efficient PDF-to-speech conversion suitable for enterprise deployment.
