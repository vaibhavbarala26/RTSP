from flask import Flask, jsonify, request
from flask_mongoengine import MongoEngine
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection using MongoEngine
app.config['MONGODB_SETTINGS'] = {
    'db': 'mydatabase',  # Replace 'mydatabase' with your database name
    'host': 'mongodb+srv://22je1042:bXFctOw8bLgyLv7P@cluster0.pywyv.mongodb.net/mydatabase?retryWrites=true&w=majority',
    'retryWrites': True
}

db = MongoEngine(app)  # Initialize MongoEngine with Flask app

@app.route('/')
def index():
    return "Connected to MongoDB Atlas with MongoEngine"

# Define a User schema using MongoEngine
class User(db.Document):
    name = db.StringField(required=True, max_length=50)
    age = db.IntField(required=True)
    email = db.EmailField(required=True, unique=True)

    def to_json(self):
        return {
            "name": self.name,
            "age": self.age,
            "email": self.email
        }

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    name = data.get('name')
    age = data.get('age')
    email = data.get('email')

    # Create and save a new user
    try:
        user = User(name=name, age=age, email=email)
        user.save()
        return jsonify({"message": "User added successfully!" , "user":user})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    users = User.objects()  # Get all User documents
    return jsonify([user.to_json() for user in users])
@app.route("/user/<id>" , methods=["GET"])
def get_user(id):
    try:
        user = User.objects.get(id=id)
        return jsonify(user), 200
    except User.DoesNotExist:
        return jsonify({"error":"Not Found"}),400
@app.route("/update_user/<id>" , methods=["PUT"])
def update_user(id):
    data = request.json
    try:
        user = User.objects.get(id=id)
        user.update(**data)
        updated_user = User.objects.get(id=id)
        return jsonify(updated_user.to_json()),200 
    except User.DoesNotExist:
        return jsonify({"error": "User not found"}), 404
if __name__ == "__main__":
    app.run(debug=True)
