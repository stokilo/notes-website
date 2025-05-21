extends Node2D

@onready var walls_node = $Walls
const Wall = preload("res://scenes/wall.tscn")
const WALL_COUNT = 20
const MIN_DISTANCE = 100  # Minimum distance between walls and from center

func _ready():
	print("Main scene started!")
	generate_walls()

func generate_walls():
	var rng = RandomNumberGenerator.new()
	rng.randomize()
	
	# Keep track of wall positions to avoid overlaps
	var wall_positions = []
	
	for i in range(WALL_COUNT):
		var wall = Wall.instantiate()
		var valid_position = false
		var attempts = 0
		var position = Vector2.ZERO
		
		# Try to find a valid position
		while not valid_position and attempts < 50:
			position = Vector2(
				rng.randf_range(100, 1180),  # Keep away from screen edges
				rng.randf_range(100, 620)
			)
			
			valid_position = true
			
			# Check distance from center (ball)
			if position.distance_to(Vector2(640, 360)) < MIN_DISTANCE:
				valid_position = false
				continue
			
			# Check distance from other walls
			for existing_pos in wall_positions:
				if position.distance_to(existing_pos) < MIN_DISTANCE:
					valid_position = false
					break
			
			attempts += 1
		
		if valid_position:
			wall.position = position
			walls_node.add_child(wall)
			wall_positions.append(position)
			print("Wall added at position: ", position)

func _process(delta):
	pass 
