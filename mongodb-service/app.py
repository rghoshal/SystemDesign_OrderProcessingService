import os
from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient(os.getenv('MONGODB_URL', 'mongodb://mongodb:27017'))
db = client['orders_db']
orders = db['orders']

@app.route('/orders', methods=['POST'])
def save_order():
    order = request.json
    orders.update_one({'orderId': order['orderId']}, {'$set': order}, upsert=True)
    return jsonify({'success': True})

@app.route('/orders', methods=['GET'])
def get_orders():
    result = list(orders.find({}, {'_id': 0}).sort('createdAt', -1).limit(50))
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    print('MongoDB Service started')
    app.run(host='0.0.0.0', port=4000)