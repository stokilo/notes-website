extends Control

func _ready():
	$StartButton.pressed.connect(_on_start_button_pressed)

func _on_start_button_pressed():
	# Change to the main game scene
	get_tree().change_scene_to_file("res://scenes/main.tscn") 