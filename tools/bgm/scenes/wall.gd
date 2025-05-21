extends StaticBody2D

func _ready():
	# Add collision shape
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = Vector2(40, 40)  # Wall size
	collision.shape = shape
	add_child(collision) 