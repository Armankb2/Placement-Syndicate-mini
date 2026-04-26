import pika
import json
import time
import os

# RabbitMQ configuration
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
QUEUE_NAME = "resume_processing"

def callback(ch, method, properties, body):
    """Processes a message from the RabbitMQ queue."""
    message = json.loads(body)
    print(f" [x] Received: {message['filename']} at {message['timestamp']}")
    print(f" [x] Processing file: {message['file_path']}")
    
    # Simulate NLP processing
    print(" [x] Starting NLP Analysis...")
    time.sleep(2)  # Simulate expensive operation
    print(" [x] NLP Analysis Complete!")
    
    # Acknowledge the message
    ch.basic_ack(delivery_tag=method.delivery_tag)
    print(" [x] Done")

def start_consumer():
    """Starts the RabbitMQ consumer."""
    print(f" [*] Waiting for messages on '{QUEUE_NAME}'. To exit press CTRL+C")
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()

        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)

        channel.start_consuming()
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")

if __name__ == "__main__":
    start_consumer()
