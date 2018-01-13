function MenuBar(){
	this.pos = createVector(0, 0);
	this.folders = [];
	this.width = width;
	this.height = 20;
	this.fill = color(220);
	this.bounds = [this.pos.x, this.pos.x + this.width, 0, this.height];
	this.folders = [];

	this.addFolder = function(f){
		this.folders = append(this.folders, new MenuBarFolder(this, f));
	}

	this.addButton = function(b, s, o){
		this.folders[this.folders.length - 1].addButton(b, s, o);
	}

	this.initialize = function(){
		for (var i = 0; i < this.folders.length; i++)
			this.folders[i].initialize();
	}

	this.show = function(){
		push();
			stroke(100);
			fill(this.fill);
			rect(this.pos.x, this.pos.y - 1, this.width, this.height + 1);
			for (var i = 0; i < this.folders.length; i++){
				this.folders[i].show();
			}
		pop();
	}

	this.setFill = function(f){
		this.fill = f;
	}

	this.folderIsOpen = function(){
		for (var i = 0; i < this.folders.length; i++){
			if (this.folders[i].is_open)
				return i;
		}
		return -1;
	}

	this.mouseOver = function(){
		if (this.withinBounds(mouseX, mouseY, this.bounds)){
			var open_idx = this.folderIsOpen();
			if (open_idx >= 0){
				var close = false;
				for (var i = 0; i < this.folders.length; i++){
					if (i != open_idx && this.folders[i].mouseOver()){
						this.folders[i].open();
						close = true;
					}
				}
				if (close)
					this.folders[open_idx].close();
			}
		}
	}

	this.onClick = function(){
		if (this.withinBounds(mouseX, mouseY, this.bounds)){
			for (var i = 0; i < this.folders.length; i++){
				if (this.folders[i].clicked())
					this.folders[i].is_open ? this.folders[i].close() : this.folders[i].open();
			}
		}
		else{
			var open_folder = this.folderIsOpen();
			if (open_folder >= 0){
				var folder = this.folders[open_folder];
				for (var i = 0; i < folder.buttons.length; i++){
					if (folder.buttons[i].clicked()){
						folder.buttons[i].onClick();
						break;
					}
				}
			}
			this.close();
		}
	}

	this.checkShortcuts = function(){
		for (var i = 0; i < this.folders.length; i++){
			for (var j = 0; j < this.folders[i].buttons.length; j++){
				if (this.folders[i].buttons[j].enabled && this.folders[i].buttons[j].shortcutPressed()){
					this.folders[i].buttons[j].onClick();
					this.close();
					break;
				}
			}
		}
	}

	this.close = function(){
		var open_folder = this.folderIsOpen();
		if (open_folder >= 0)
			this.folders[open_folder].close();
	}

	this.enableButtons = function(labels){
		for (var i = 0; i < this.folders.length; i++){
			for (var j = 0; j < this.folders[i].buttons.length; j++){
				if (labels.indexOf(this.folders[i].buttons[j].label) > -1)
					this.folders[i].buttons[j].enable();
				else
					this.folders[i].buttons[j].disable();
			}
		}
	}

	this.withinBounds = function(x, y, bounds){
		return (x >= bounds[0] && x <= bounds[1] && y >= bounds[2] && y <= bounds[3]);
	}

	this.onKeyPress = function(){
		if (this.folderIsOpen() >= 0){
			if (keyCode == ESCAPE)
				this.close();
		}
	}

	this.resize = function(w){
		this.width = w;
	}
}