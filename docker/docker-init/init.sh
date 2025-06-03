#!/bin/bash

# Configure SNS for email notifications
echo "Setting up SNS topic for email notifications..."
TOPIC_ARN=$(awslocal sns create-topic --name notifications-topic --output text)
echo "SNS Topic ARN: $TOPIC_ARN"

# Export the topic ARN to a file for reference
echo "export AWS_SNS_TOPIC_ARN=$TOPIC_ARN" > /tmp/sns-config.sh

echo "SNS configured successfully" 

# Criar bucket S3 para armazenamento de arquivos
echo "Criando bucket S3..."
BUCKET_NAME="mikko-bucket-local"
awslocal s3 mb s3://$BUCKET_NAME

# Configurar permissões CORS para o bucket
echo "Configurando CORS para permitir URLs assinadas..."
cat > /tmp/cors-config.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "MaxAgeSeconds": 3000,
      "ExposeHeaders": ["ETag", "x-amz-meta-custom-header", "x-amz-server-side-encryption"]
    }
  ]
}
EOF

awslocal s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file:///tmp/cors-config.json

# Exportar nome do bucket para referência
echo "export AWS_S3_BUCKET_NAME=$BUCKET_NAME" >> /tmp/sns-config.sh

echo "Bucket S3 criado e configurado com sucesso" 

awslocal --endpoint-url=http://localhost:4566 sqs create-queue --queue-name categorize-extract-dev


# Verificar tabelas DynamoDB
awslocal dynamodb list-tables

# Verificar filas SQS
awslocal sqs list-queues

# Verificar tópicos SNS
awslocal sns list-topics

# Verificar buckets S3
awslocal s3 ls

# Verificar funções Lambda
awslocal lambda list-functions

awslocal lambda invoke \
  --function-name mikkoapi-dev-categorize-extract \
  --payload '{"Records":[{"body":"{\"categorizeExtractId\":\"lambda-id-123\",\"onboardingId\":\"lambda-onboarding-123\"}"}]}' \
  /tmp/output.json