var vm = new Vue({
	el:'#editFloorplanApp',
	data: {
		image:'',
		x:0,
		y:0,
		allowAdd: false,
		floorplanWidth:700,
		floorplanHeight:700
	},
	methods: {
		onFileChange(e) {
			var files = e.target.files || e.dataTransfer.files;
			if (!files.length)
				return;
			this.createImage(files[0]);
		},
		createImage(file) {
			var image = new Image();
			var reader = new FileReader();
			reader.onload = (e) => {
				this.image = e.target.result;
			};
			reader.readAsDataURL(file);
		},
		removeImage: function (e) {
			this.image = '';
		},
		dragStart: function(e,type){
			this.type = type;
			e.dataTransfer.setData('text/plain', '');
			e.dataTransfer.setDragImage(e.target, 0, 0);
			this.allowAdd = true;
		},
		allowDrop: function(e) {
			e.preventDefault();
			this.x = getCrossBrowserElementCoords(event).x;
			this.y = getCrossBrowserElementCoords(event).y;
		},
		drop: function(e){
			if(this.allowAdd){
				this.allowAdd=false;
				if(this.x+50>this.floorplanWidth || this.y+50>this.floorplanHeight) return false;
				var newDiv = document.createElement("div");
				newDiv.className+=" resize-drag "+this.type;
				newDiv.zIndex = 2;
				newDiv.style.height="50px";
				newDiv.style.width="50px";
				newDiv.style.position = "absolute";
				newDiv.style.left = this.x + "px";
				newDiv.style.top = this.y + "px";
				newDiv.style.WebkitTransformOrigin = "50% 50%";
				newDiv.style.msTransformOrigin = "50% 50%";
				newDiv.style.transformOrigin = "50% 50%";
				newDiv.style.WebkitTransform = "rotate(0deg)";
				newDiv.style.msTransform = "rotate(0deg)";
				newDiv.style.transform = "rotate(0deg)";
				var newHandle = document.createElement("div");
				newHandle.style.width = "10px";
				newHandle.style.height = "10px";
				newHandle.style.position = "absolute";
				newHandle.style.zIndex = 3;
				newHandle.style.top="20px";
				newHandle.style.left = "120%";
				newHandle.style.backgroundColor="green";
				newHandle.className+="handle";
				newDiv.appendChild(newHandle);
				document.getElementById("floorplanDiv").appendChild(newDiv);
			}
		}
	},
	ready:function(){
		document.body.ondblclick=function(e){
			if (e.target.className.includes("atRisk") || e.target.className.includes("entrance")) {
				if(confirm("Do you want to delete this area?")){
					e.target.parentNode.removeChild(e.target);
				}
			}
		}
		document.body.onmousedown = function(e){
			if (e.target.className=="handle") {
				this.rotationTarget = e.target.parentNode;
				e.stopPropagation();
				if (!$(e.target.parentNode).data("origin")) $(e.target.parentNode).data("origin", {
					left: $(e.target.parentNode).offset().left,
					top: $(e.target.parentNode).offset().top
				});
				this.h_x = e.pageX;
				this.h_y = e.pageY; // clicked point
				this.o_x = $(e.target.parentNode).data("origin").left;
				this.o_y = $(e.target.parentNode).data("origin").top; // origin point
				this.last_angle = $(e.target.parentNode).data("last_angle") || 0;
			}
		}
		document.body.onmousemove = function(e){
			if(this.rotationTarget===null) return false;
			var s_x = e.pageX,
			s_y = e.pageY; //starting point
			var h_x=this.h_x, h_y=this.h_y, o_x=this.o_x, o_y=this.o_y, last_angle=this.last_angle;
			if (s_x !== o_x && s_y !== o_y) {
			var s_rad = Math.atan2(s_y - o_y, s_x - o_x); // current to origin
			s_rad -= Math.atan2(h_y - o_y, h_x - o_x); // handle to origin
			s_rad += last_angle; // relative to the last one
			this.s_rad=s_rad;
			var degree = (s_rad * (360 / (2 * Math.PI)));
			var target = $(this.rotationTarget);
			target.css('-moz-transform', 'rotate(' + degree + 'deg)');
			target.css('-moz-transform-origin', '50% 50%');
			target.css('-webkit-transform', 'rotate(' + degree + 'deg)');
			target.css('-webkit-transform-origin', '50% 50%');
			target.css('-o-transform', 'rotate(' + degree + 'deg)');
			target.css('-o-transform-origin', '50% 50%');
			target.css('-ms-transform', 'rotate(' + degree + 'deg)');
			target.css('-ms-transform-origin', '50% 50%');
			}
		}
		document.body.onmouseup = function(e){
			this.rotationTarget = null;
			var h_x=this.h_x, h_y=this.h_y, o_x=this.o_x, o_y=this.o_y,last_angle=this.last_angle;
			var s_x = e.pageX,s_y = e.pageY;
			s_rad=this.s_rad;
			// Saves the last angle for future iterations
			s_rad = Math.atan2(s_y - o_y, s_x - o_x);// current to origin
			s_rad -= Math.atan2(h_y - o_y, h_x - o_x); // handle to origin
			s_rad += last_angle;
			$(e.target.parentNode).data("last_angle", s_rad);
		}
	}
})


function getCrossBrowserElementCoords(mouseEvent){
	var result = {
		x: 0,
		y: 0
	};

	if (!mouseEvent){
		mouseEvent = window.event;
	}
	if (mouseEvent.clientX || mouseEvent.clientY){
		result.x = mouseEvent.clientX + document.body.scrollLeft +
		document.documentElement.scrollLeft;
		result.y = mouseEvent.clientY + document.body.scrollTop +
		document.documentElement.scrollTop;
	}
	if (mouseEvent.target){
		var offEl = mouseEvent.target;
		var offX = 0;
		var offY = 0;
		if(offEl.id && !offEl.getAttribute('id').startsWith('floorplanDiv')){
			offEl = offEl.parentElement;
		}
		if (typeof(offEl.offsetParent) != "undefined"){
			while (offEl){
				 offX += offEl.offsetLeft;
				 offY += offEl.offsetTop;
				 offEl = offEl.offsetParent;
			}
		}
		else{
			offX = offEl.x;
			offY = offEl.y;
		}

		result.x -= offX;
		result.y -= offY;
	}
	return result;
}

function dragMoveListener (event) {
	if(event.interaction.downEvent.button == 2) {
		return false;
	}
	var target = event.target,
		// keep the dragged position in the data-x/data-y attributes
		x = (parseInt(target.style.left) ) + event.dx,
		y = (parseInt(target.style.top) ) + event.dy;
	target.style.top = y+"px";
	target.style.left = x+"px";

}



interact('.resize-drag')
	.draggable({
		onstart: function(event){
			if(event.interaction.downEvent.button == 2) {
				return false;
			}
			vm.saved = false;
			var target = event.target,
				// keep the dragged position in the data-x/data-y attributes
				x = (parseInt(target.style.left) ) + event.dx,
				y = (parseInt(target.style.top) ) + event.dy;
		},
		onmove: dragMoveListener,
		restrict: {
			elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
			restriction:"parent",
			endOnly:false
		},
		// enable autoScroll
		autoScroll: true
	})
	.resizable({
		edges: { left: true, right: true, bottom: true, top: true }
	})
	.on('resizemove', function (event) {
		if(event.interaction.downEvent.button == 2) {
			return false;
		}
		var parentWidth = 700;
		var parentHeight = 700;
		var target = event.target,
			x = parseInt(target.style.left),
			y = parseInt(target.style.top);


		horizontal(); //handle the resizing and snapping of top and bottom edges
		vertical();	//handle the resizing and snapping of left and right edges
		event.target.childNodes[0].style.top = (parseInt(event.target.style.height)/2-5)+"px";
		function horizontal(){
			if(event.edges.left && (x<=0) && (event.dx<0)) return false;
			if(event.edges.left && parseInt(target.style.width)===0 && event.dx>0) return false;
			if(event.edges.left && parseInt(target.style.width)-event.dx>=0) x += event.dx;
			if (event.edges.right && (x+parseInt(target.style.width)+event.dx>parentWidth)&&event.dx>0) {
				target.style.width=(parentWidth-x)+'px';
				target.style.left=x+"px";
				return false;
			}
			if(event.edges.right) target.style.width  = parseInt(target.style.width)+event.dx + 'px';
			if(event.edges.left) target.style.width  = parseInt(target.style.width)-event.dx + 'px';
			if (x<0) {
				target.style.width = (parseInt(target.style.width)+x)+"px";
				x=0;
			}
			target.style.left=x+"px";
		}

		function vertical(){
			if(event.edges.top && (y<=0) && (event.dy<0)) return false;
			if(event.edges.top && parseInt(target.style.height)===0 && event.dy>0) return false;
			if(event.edges.top && parseInt(target.style.height)-event.dy>=0) y += event.dy;
			if (event.edges.bottom && (y+parseInt(target.style.height)+event.dy>parentHeight)&&event.dy>0) {
				target.style.height=(parentHeight-y)+'px';
				target.style.top=y+"px";
				return false;
			}
			if(event.edges.bottom) target.style.height  = parseInt(target.style.height)+event.dy + 'px';
			if(event.edges.top) target.style.height  = parseInt(target.style.height)-event.dy + 'px';
			if (y<0) {
				target.style.height = (parseInt(target.style.height)+y)+"px";
				y=0;
			}
			target.style.top=y+"px";
		}
	});