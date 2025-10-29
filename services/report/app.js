const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}

async function processMessage(msg) {
    try {
        const content = JSON.parse(msg.content.toString())
        console.log('Received message:', content)
        
        if (content.products) {
            await updateReport(content.products)
            await printReport()
        }
    } catch (error) {
        console.error('Error processing message:', error.message)
    }
}

async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }
}

async function printReport() {
    console.log('\n--- Sales Report ---')
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} sales`);
    }
    console.log('-------------------\n')
}

async function consume() {
    console.log(`SUCCESSFULLY SUBSCRIBED TO QUEUE: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {processMessage(msg)})
} 

consume()